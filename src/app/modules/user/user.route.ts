import express from "express";
import { UserController } from "./user.controller";
import { isAdmin } from "../../middleware/auth";
const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
// Approve user account
router.patch("/:id/approve", isAdmin, UserController.approveAgent);
export const AuthRoutes = router;
