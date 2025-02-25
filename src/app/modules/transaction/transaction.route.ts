import express from "express";
import { TransactionController } from "./transaction.controller";
import { isAuthenticated } from "../../middleware/authMiddleware";

const router = express.Router();

router.post("/send-money", isAuthenticated, TransactionController.sendMoney);
router.post("/cash-out", isAuthenticated, TransactionController.cashOut);
router.post("/cash-in", isAuthenticated, TransactionController.cashIn);

export const TransactionRoutes = router;
