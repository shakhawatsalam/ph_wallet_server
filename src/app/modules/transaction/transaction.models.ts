import mongoose, { Schema, model } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.interface";
const TransactionSchema = new Schema<ITransaction>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    fee: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<ITransaction>("Transaction", TransactionSchema);
