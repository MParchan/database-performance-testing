import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryId: {
        type: Number,
        require: [true, "Category id is required"],
    },
    name: {
        type: String,
        require: [true, "Category name is required"],
    },
});

export default mongoose.model("Category", categorySchema);
