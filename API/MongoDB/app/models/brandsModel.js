import mongoose from "mongoose";

const brandSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Brand name is required"],
        },
        country: {
            type: String,
            require: [true, "Brand name is required"],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Brand", brandSchema);
