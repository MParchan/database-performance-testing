import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";

//@desc Get all products
//@route GET /api/products
//@access public
const allProducts = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute(
                "SELECT P.*, B.Name AS BrandName, B.Country AS BrandCountry, C.Name AS CategoryName FROM Pdb_Product P JOIN Pdb_Brand B ON P.BrandId = B.BrandId JOIN Pdb_Category C ON P.CategoryId = C.CategoryId"
            );
            const jsonProducts = result.rows.map((row) => {
                const jsonProduct = {
                    productId: row[0],
                    brandId: row[1],
                    categoryId: row[2],
                    name: row[3],
                    description: row[4],
                    price: row[5],
                    quantityAvailable: row[6],
                    brand: {
                        brandId: row[1],
                        name: row[7],
                        country: row[8],
                    },
                    category: {
                        categoryId: row[2],
                        name: row[9],
                    },
                };
                return jsonProduct;
            });
            res.status(200).json(jsonProducts);
        } catch (err) {
            console.log(err);
            res.status(500);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Create new product
//@route POST /api/products
//@access public
const createProduct = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { brandId, categoryId, name, description, price, quantityAvailable } = req.body;
            if (
                !brandId ||
                !categoryId ||
                !name ||
                !description ||
                (!price && price !== 0) ||
                (!quantityAvailable && quantityAvailable !== 0)
            ) {
                throw new Error("All fields are mandatory");
            }
            connection = await oracledb.getConnection();
            const category = await connection.execute("SELECT * FROM Pdb_Category WHERE CategoryId = :1", [categoryId]);
            if (category.rows.length === 0) {
                throw new Error("Category with the given ID does not exist");
            }
            const brand = await connection.execute("SELECT * FROM Pdb_Brand WHERE BrandId = :brandId", [brandId]);
            if (brand.rows.length === 0) {
                throw new Error("Brand with the given ID does not exist");
            }
            const lastProduct = await connection.execute("SELECT MAX(ProductId) AS maxProductId FROM Pdb_Product");
            const maxProductId = lastProduct.rows[0][0];
            const newProductId = maxProductId + 1;
            await connection.execute(
                "INSERT INTO Pdb_Product (productId, brandId, categoryId, name, description, price, quantityAvailable) VALUES (:1, :2, :3, :4, :5, :6, :7)",
                [newProductId, brandId, categoryId, name, description, price, quantityAvailable]
            );
            await connection.execute("COMMIT");
            res.status(201).json({
                productId: newProductId,
                brandId: Number(brandId),
                categoryId: Number(categoryId),
                name: name,
                description: description,
                price: Number(price),
                quantityAvailable: Number(quantityAvailable),
            });
        } catch (err) {
            console.log(err);
            res.status(400);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Get product
//@route GET /api/products/:id
//@access public
const getProduct = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const product = await connection.execute(
                "SELECT P.*, B.Name AS BrandName, B.Country AS BrandCountry, C.Name AS CategoryName FROM Pdb_Product P JOIN Pdb_Brand B ON P.BrandId = B.BrandId JOIN Pdb_Category C ON P.CategoryId = C.CategoryId WHERE P.ProductId = :1",
                [id]
            );
            if (product.rows.length === 0) {
                throw new Error("Product not found");
            }
            const jsonProduct = {
                productId: product.rows[0][0],
                brandId: product.rows[0][1],
                categoryId: product.rows[0][2],
                name: product.rows[0][3],
                description: product.rows[0][4],
                price: product.rows[0][5],
                quantityAvailable: product.rows[0][6],
                brand: {
                    brandId: product.rows[0][1],
                    name: product.rows[0][7],
                    country: product.rows[0][8],
                },
                category: {
                    categoryId: product.rows[0][2],
                    name: product.rows[0][9],
                },
            };
            res.status(200).json(jsonProduct);
        } catch (err) {
            console.log(err);
            res.status(404);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Update product
//@route PUT /api/products/:id
//@access public
const updateProduct = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            const { brandId, categoryId, name, description, price, quantityAvailable } = req.body;
            connection = await oracledb.getConnection();
            const product = await connection.execute("SELECT * FROM Pdb_Product WHERE ProductId = :1", [id]);
            if (product.rows.length === 0) {
                throw new Error("Product not found");
            }
            let updatedBrandId = brandId ? Number(brandId) : product.rows[0][1];
            let updatedCategoryId = categoryId ? Number(categoryId) : product.rows[0][2];
            let updatedName = name ? name : product.rows[0][3];
            let updatedDescription = description ? description : product.rows[0][4];
            let updatedPrice = price ? Number(price) : price === 0 ? Number(price) : product.rows[0][5];
            let updatedQuantityAvailable = quantityAvailable
                ? Number(quantityAvailable)
                : quantityAvailable === 0
                ? Number(quantityAvailable)
                : product.rows[0][6];
            await connection.execute(
                "UPDATE Pdb_Product SET BrandId = :1, CategoryId = :2, Name = :3, Description = :4, Price = :5, QuantityAvailable = :6 WHERE ProductId = :7",
                [
                    updatedBrandId,
                    updatedCategoryId,
                    updatedName,
                    updatedDescription,
                    updatedPrice,
                    updatedQuantityAvailable,
                    id,
                ]
            );
            await connection.execute("COMMIT");
            const jsonProduct = {
                productId: Number(id),
                brandId: updatedBrandId,
                categoryId: updatedCategoryId,
                name: updatedName,
                description: updatedDescription,
                price: updatedPrice,
                quantityAvailable: updatedQuantityAvailable,
            };
            res.status(200).json(jsonProduct);
        } catch (err) {
            console.log(err);
            res.status(404);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Delete product
//@route DELETE /api/products/:id
//@access public
const deleteProduct = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const result = await connection.execute("DELETE FROM Pdb_Product WHERE ProductId = :1", [id]);
            if (!result.rowsAffected) {
                throw new Error("Product not found");
            }
            await connection.execute("COMMIT");
            res.status(200).json({ message: `Successfully removed product with id: ${id}` });
        } catch (err) {
            console.log(err);
            next(err);
            res.status(404);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

export { allProducts, createProduct, getProduct, updateProduct, deleteProduct };
