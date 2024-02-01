import asyncHandler from "express-async-handler";
import Category from "../models/categoriesModel.js";
import ErrorWithStatus from "../middleware/errorWithStatus.js";

//@desc Get all categories
//@route GET /api/categories
//@access public
const allCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
});

//@desc Create new category
//@route POST /api/categories
//@access public
const createCategory = asyncHandler(async (req, res, next) => {
    try {
        const { categoryId, name } = req.body;
        if (!name || !categoryId) {
            throw new ErrorWithStatus("All fields are mandatory", 400);
        }
        const category = await Category.create({
            categoryId,
            name,
        });
        res.status(201).json(category);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
});

//@desc Get category
//@route GET /api/categories/:id
//@access public
const getCategory = asyncHandler(async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).exec();
        if (!category) {
            throw new ErrorWithStatus("Category not found", 404);
        }
        res.status(200).json(category);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

//@desc Update category
//@route PUT /api/categories/:id
//@access public
const updateCategory = asyncHandler(async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            throw new ErrorWithStatus("Category not found", 404);
        }
        res.status(200).json(category);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

//@desc Delete category
//@route DELETE /api/categories/:id
//@access public
const deleteCategory = asyncHandler(async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            throw new ErrorWithStatus("Category not found", 404);
        }
        res.status(200).json(category);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

export { allCategories, createCategory, getCategory, updateCategory, deleteCategory };
