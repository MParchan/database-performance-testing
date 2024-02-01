import express from "express";
import { allEvents, createEvent, getEvent, getUserEvents, joinEvent } from "../controllers/eventsController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.get("/", allEvents);
router.get("/user", validateToken, getUserEvents);
router.get("/:id", getEvent);
router.post("/", validateToken, createEvent);
router.post("/join", validateToken, joinEvent);

export default router;
