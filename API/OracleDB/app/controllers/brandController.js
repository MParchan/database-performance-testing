import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize, close } from "../config/dbConnection.js";

//@desc Get all brands
//@route GET /api/brands
//@access public
const getBrands = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const connection = await oracledb.getConnection();
            const brands = await connection.execute("SELECT * FROM Pdb_brand");
            res.status(200).json(brands.rows);
        } catch {
            res.status(500);
            throw new Error("Internal Server Error");
        }
    }
    initialize()
        .then(() => queryDatabase())
        .then(() => close())
        .catch((err) => console.error(err));
});

//@desc Create new brand
//@route POST /api/brands
//@access public
const createBrand = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const { name, country } = req.body;
            if (!name || !country) {
                res.status(400);
                throw new Error("All fields are mandatory");
            }
            const connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT MAX(BrandId) AS maxBrandId FROM Pdb_brand");
            const maxBrandId = result.rows[0].maxBrandId;
            const newBrandId = maxBrandId + 1;
            const brand = await connection.execute(
                "INSERT INTO Pdb_brand (BrandId, Name, Country) VALUES (:1, :2, :3)",
                [newBrandId, name, country]
            );

            res.status(201).json(brand);
        } catch (error) {
            res.status(500);
            throw new Error("Internal Server Error");
        }
    }
    initialize()
        .then(() => queryDatabase())
        .then(() => close())
        .catch((err) => console.error(err));
});

//@desc Get brand
//@route GET /api/brands/:id
//@access public
const getBrand = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const brand = await connection.execute("SELECT * FROM Pdb_brand WHERE BrandId = :1", [id]);
            if (!brand.rows) {
                res.status(404);
                throw new Error("Brand not found");
            }
            res.status(200).json(brand.rows);
        } catch (err) {
            console.log(err);
            res.status(404);
            throw new Error("Brand not found");
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Błąd podczas zamykania połączenia:", err);
                }
            }
        }
    }
    initialize()
        .then(() => queryDatabase())
        .catch((err) => console.error(err));
});

//@desc Update brand
//@route PUT /api/brands/:id
//@access public
const updateBrand = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const { id } = req.params;
            const { name, country } = req.body;
            const connection = await oracledb.getConnection();
            const brand = await connection.execute("UPDATE Pdb_brand SET Name = :1, Country = :2 WHERE BrandId = :3", [
                name,
                country,
                id,
            ]);
            if (!brand) {
                res.status(404);
                throw new Error("Brand not found");
            }
            res.status(200).json(brand);
        } catch {
            res.status(404);
            throw new Error("Brand not found");
        }
    }
    initialize()
        .then(() => queryDatabase())
        .then(() => close())
        .catch((err) => console.error(err));
});

//@desc Delete brand
//@route DELETE /api/brands/:id
//@access public
const deleteBrand = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const { id } = req.params;
            const connection = await oracledb.getConnection();
            const brand = await connection.execute("DELETE FROM Pdb_brand WHERE BrandId = :1", [id]);
            if (!brand) {
                res.status(404);
                throw new Error("Brand not found");
            }
            res.status(200).json(brand);
        } catch {
            res.status(404);
            throw new Error("Brand not found");
        }
    }
    initialize()
        .then(() => queryDatabase())
        .then(() => close())
        .catch((err) => console.error(err));
});

export { getBrands, createBrand, getBrand, updateBrand, deleteBrand };
