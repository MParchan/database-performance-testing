import express from "express";
import {
    allCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.route("/").get(allCategories).post(createCategory);
router.route("/:id").get(getCategory).put(updateCategory).delete(deleteCategory);

export default router;
