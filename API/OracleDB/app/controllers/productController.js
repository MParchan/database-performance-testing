import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize, close } from "../config/dbConnection.js";

//@desc Get all products
//@route GET /api/products
//@access public
const getProducts = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const connection = await oracledb.getConnection();
            const products = await connection.execute("SELECT * FROM Pdb_product");
            res.status(200).json(products.rows);
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

//@desc Create new product
//@route POST /api/products
//@access public
const createProduct = asyncHandler(async (req, res) => {
    async function queryDatabase() {
        try {
            const connection = await oracledb.getConnection();
            const product = await connection.execute("INSERT INTO Pdb_product (column1, column2) VALUES (:1, :2)", [
                data.value1,
                data.value2,
            ]);

            res.status(201).json(product);
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

export { getProducts, createProduct };
