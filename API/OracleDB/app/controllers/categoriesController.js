import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";

//@desc Get all categories
//@route GET /api/categories
//@access public
const allCategories = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT * FROM Pdb_Category");
            const jsonCategories = result.rows.map((row) => {
                const jsonCategory = {
                    categoryId: row[0],
                    name: row[1],
                };
                return jsonCategory;
            });
            res.status(200).json(jsonCategories);
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

//@desc Create new category
//@route POST /api/categories
//@access public
const createCategory = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { name } = req.body;
            if (!name) {
                throw new Error("All fields are mandatory");
            }
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT MAX(CategoryId) AS maxCategoryId FROM Pdb_Category");
            const maxCategoryId = result.rows[0][0];
            const newCategoryId = maxCategoryId + 1;
            await connection.execute("INSERT INTO Pdb_Category (CategoryId, Name) VALUES (:1, :2)", [
                newCategoryId,
                name,
            ]);
            await connection.execute("COMMIT");
            res.status(201).json({ categoryId: newCategoryId, name: name });
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

//@desc Get category
//@route GET /api/categories/:id
//@access public
const getCategory = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const category = await connection.execute("SELECT * FROM Pdb_Category WHERE CategoryId = :1", [id]);
            if (category.rows.length === 0) {
                throw new Error("Category not found");
            }
            res.status(200).json({ categoryId: category.rows[0][0], name: category.rows[0][1] });
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

//@desc Update category
//@route PUT /api/categories/:id
//@access public
const updateCategory = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            const { name } = req.body;
            connection = await oracledb.getConnection();
            const category = await connection.execute("SELECT * FROM Pdb_Category WHERE CategoryId = :1", [id]);
            if (category.rows.length === 0) {
                throw new Error("Category not found");
            }
            let updatedName = name ? name : category.rows[0][1];
            await connection.execute("UPDATE Pdb_Category SET Name = :1 WHERE CategoryId = :3", [updatedName, id]);
            await connection.execute("COMMIT");
            res.status(200).json({ categoryId: Number(id), name: updatedName });
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

//@desc Delete category
//@route DELETE /api/categories/:id
//@access public
const deleteCategory = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const result = await connection.execute("DELETE FROM Pdb_Category WHERE CategoryId = :1", [id]);
            if (!result.rowsAffected) {
                throw new Error("Category not found");
            }
            await connection.execute("COMMIT");
            res.status(200).json({ message: `Successfully removed category with id: ${id}` });
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

export { allCategories, createCategory, getCategory, updateCategory, deleteCategory };
