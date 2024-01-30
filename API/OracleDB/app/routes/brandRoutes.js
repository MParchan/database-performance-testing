import express from "express";
import { getBrands, createBrand, getBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";

const router = express.Router();

router.route("/").get(getBrands).post(createBrand);

router.route("/:id").get(getBrand).put(updateBrand).delete(deleteBrand);

export default router;
