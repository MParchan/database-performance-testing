import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    productId: {
        type: Number,
        required: [true, "Category id is required"],
    },
    brandId: {
        type: Number,
        required: [true, "Brand id is required"],
        ref: "Brand",
    },
    categoryId: {
        type: Number,
        required: [true, "Category id is required"],
    },
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
    },
    quantityAvailable: {
        type: Number,
        required: [true, "Product quantityAvailable is required"],
    },
});

export default mongoose.model("Product", productSchema, "Product");
