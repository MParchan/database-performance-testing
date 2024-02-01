import asyncHandler from "express-async-handler";
import Product from "../models/productsModel.js";
import ErrorWithStatus from "../middleware/errorWithStatus.js";

//@desc Get all products
//@route GET /api/products
//@access public
const allProducts = asyncHandler(async (req, res, next) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
});

//@desc Create new product
//@route POST /api/products
//@access public
const createProduct = asyncHandler(async (req, res, next) => {});

//@desc Get product
//@route GET /api/products/:id
//@access public
const getProduct = asyncHandler(async (req, res, next) => {});

//@desc Update product
//@route PUT /api/products/:id
//@access public
const updateProduct = asyncHandler(async (req, res, next) => {});

//@desc Delete product
//@route DELETE /api/products/:id
//@access public
const deleteProduct = asyncHandler(async (req, res, next) => {});

export { allProducts, createProduct, getProduct, updateProduct, deleteProduct };
