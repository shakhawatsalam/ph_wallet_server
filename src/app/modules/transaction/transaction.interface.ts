import mongoose, { Document } from "mongoose";
export enum TransactionType {
  SEND_MONEY = "SendMoney",
  CASH_OUT = "CashOut",
  CASH_IN = "CashIn",
  DEPOSIT = "Deposit", // if needed in the future
}
export interface ITransaction extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  fee?: number;
  timestamp: Date;
}
