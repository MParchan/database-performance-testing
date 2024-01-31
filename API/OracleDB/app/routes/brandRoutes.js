import express from "express";
import { allBrands, createBrand, getBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";

const router = express.Router();

router.route("/").get(allBrands).post(createBrand);

router.route("/:id").get(getBrand).put(updateBrand).delete(deleteBrand);

export default router;
