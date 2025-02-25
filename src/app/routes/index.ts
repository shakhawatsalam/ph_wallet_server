import express from "express";
import { AuthRoutes } from "../modules/user/user.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/transactions",
    route: TransactionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
