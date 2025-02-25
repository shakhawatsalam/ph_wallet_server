import express from "express";
import { UserController } from "./user.controller";
const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
export const AuthRoutes = router;
