import express from "express";
import { allProducts, createProduct, deleteProduct, getProduct, updateProduct } from "../controllers/productController.js";

const router = express.Router();

router.route("/").get(allProducts).post(createProduct);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

export default router;
