import express from "express";
import validateToken from "../middleware/validateTokenHandler.js";
import { currentUser, loginUser, registerUser } from "../controllers/usersController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", validateToken, currentUser);

export default router;
