import express from "express";
import validateToken from "../middleware/validateTokenHandler.js";
import { allOrders, createOrder, getOrder } from "../controllers/ordersController.js";

const router = express.Router();

router.use(validateToken);
router.route("/").get(allOrders).post(createOrder);
router.route("/:id").get(getOrder);

export default router;
