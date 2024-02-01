import mongoose from "mongoose";

const brandSchema = mongoose.Schema({
    categoryId: {
        type: Number,
        required: [true, "Category id is required"],
    },
    name: {
        type: String,
        require: [true, "Brand name is required"],
    },
    country: {
        type: String,
        require: [true, "Brand name is required"],
    },
});

export default mongoose.model("Brand", brandSchema, "Brand");
