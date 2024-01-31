import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";

//@desc Get all brands
//@route GET /api/brands
//@access public
const allBrands = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT * FROM Pdb_brand");
            const jsonBrands = result.rows.map((row) => {
                const jsonBrand = {
                    brandId: row[0],
                    name: row[1],
                    country: row[2],
                };
                return jsonBrand;
            });
            res.status(200).json(jsonBrands);
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

//@desc Create new brand
//@route POST /api/brands
//@access public
const createBrand = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { name, country } = req.body;
            if (!name || !country) {
                throw new Error("All fields are mandatory");
            }
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT MAX(BrandId) AS maxBrandId FROM Pdb_brand");
            const maxBrandId = result.rows[0][0];
            const newBrandId = maxBrandId + 1;
            await connection.execute("INSERT INTO Pdb_brand (BrandId, Name, Country) VALUES (:1, :2, :3)", [
                newBrandId,
                name,
                country,
            ]);
            await connection.execute("COMMIT");
            res.status(201).json({ brandId: newBrandId, name: name, country: country });
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

//@desc Get brand
//@route GET /api/brands/:id
//@access public
const getBrand = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const brand = await connection.execute("SELECT * FROM Pdb_brand WHERE BrandId = :1", [id]);
            if (brand.rows.length === 0) {
                throw new Error("Brand not found");
            }
            res.status(200).json({ brandId: brand.rows[0][0], name: brand.rows[0][1], country: brand.rows[0][2] });
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

//@desc Update brand
//@route PUT /api/brands/:id
//@access public
const updateBrand = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            const { name, country } = req.body;
            connection = await oracledb.getConnection();
            const brand = await connection.execute("SELECT * FROM Pdb_brand WHERE BrandId = :1", [id]);
            if (brand.rows.length === 0) {
                throw new Error("Brand not found");
            }
            let updatedName = name ? name : brand.rows[0][1];
            let updatedCountry = country ? country : brand.rows[0][2];
            await connection.execute("UPDATE Pdb_brand SET Name = :1, Country = :2 WHERE BrandId = :3", [
                updatedName,
                updatedCountry,
                id,
            ]);
            await connection.execute("COMMIT");
            res.status(200).json({ brandId: Number(id), name: updatedName, country: updatedCountry });
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

//@desc Delete brand
//@route DELETE /api/brands/:id
//@access public
const deleteBrand = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const brand = await connection.execute("DELETE FROM Pdb_brand WHERE BrandId = :1", [id]);
            if (!brand.rowsAffected) {
                throw new Error("Brand not found");
            }
            await connection.execute("COMMIT");
            res.status(200).json({ message: `Successfully removed brand with id: ${id}` });
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

export { allBrands, createBrand, getBrand, updateBrand, deleteBrand };
