import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryId: {
        type: Number,
        required: [true, "Category id is required"],
    },
    name: {
        type: String,
        required: [true, "Category name is required"],
    },
});

export default mongoose.model("Category", categorySchema, "Category");
