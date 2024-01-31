import express from "express";
import { allRoles, createRole, getRole, updateRole, deleteRole } from "../controllers/rolesController.js";

const router = express.Router();

router.route("/").get(allRoles).post(createRole);
router.route("/:id").get(getRole).put(updateRole).delete(deleteRole);

export default router;
