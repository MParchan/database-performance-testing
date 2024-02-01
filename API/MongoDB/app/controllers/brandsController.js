import asyncHandler from "express-async-handler";
import Brand from "../models/brandsModel.js";
import ErrorWithStatus from "../middleware/errorWithStatus.js";

//@desc Get all brands
//@route GET /api/brands
//@access public
const allBrands = asyncHandler(async (req, res, next) => {
    try {
        const brands = await Brand.find({});
        res.status(200).json(brands);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
});

//@desc Create new brand
//@route POST /api/brand
//@access public
const createBrand = asyncHandler(async (req, res, next) => {
    try {
        const { brandId, name, country } = req.body;
        if (!brandId || !name || !country) {
            throw new ErrorWithStatus("All fields are mandatory", 400);
        }
        const brand = await Brand.create({
            brandId,
            name,
            country,
        });
        res.status(201).json(brand);
    } catch (err) {
        console.log(err);
        res.status(500);
        next(err);
    }
});

//@desc Get brand
//@route GET /api/brands/:id
//@access public
const getBrand = asyncHandler(async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id).exec();
        if (!brand) {
            throw new ErrorWithStatus("Brand not found", 404);
        }
        res.status(200).json(brand);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

//@desc Update brand
//@route PUT /api/brands/:id
//@access public
const updateBrand = asyncHandler(async (req, res, next) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!brand) {
            throw new ErrorWithStatus("Brand not found", 404);
        }
        res.status(200).json(brand);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

//@desc Delete brand
//@route DELETE /api/brands/:id
//@access public
const deleteBrand = asyncHandler(async (req, res, next) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            throw new ErrorWithStatus("Brand not found", 404);
        }
        res.status(200).json(brand);
    } catch (err) {
        console.log(err);
        res.status(err.status);
        next(err);
    }
});

export { allBrands, createBrand, getBrand, updateBrand, deleteBrand };
