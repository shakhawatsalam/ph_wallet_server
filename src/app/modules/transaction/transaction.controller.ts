import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../user/user.models";
import { TransactionType } from "../transaction/transaction.interface";
import Transaction from "../transaction/transaction.models";

// Send Mony
export const sendMoney = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { senderId, receiverPhone, amount } = req.body;

    if (amount < 50) {
      res.status(400).json({ message: "Minimum send amount is 50 taka" });
      return;
    }

    // Find sender
    const sender = await User.findById(senderId);
    if (!sender) {
      res.status(404).json({ message: "Sender not found" });
      return;
    }

    // Find receiver using mobileNumber
    const receiver = await User.findOne({ mobileNumber: receiverPhone });
    if (!receiver) {
      res.status(404).json({ message: "Receiver not found" });
      return;
    }

    let fee = 0;
    if (amount > 100) {
      fee = 5;
    }
    const totalDeduction = amount + fee;

    if (sender.balance < totalDeduction) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    sender.balance -= totalDeduction;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    if (fee > 0) {
      const admin = await User.findOne({ role: "Admin" });
      if (admin) {
        admin.balance += fee;
        await admin.save();
      }
    }

    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: TransactionType.SEND_MONEY,
      fee,
    });

    res.status(200).json({
      message: "Send money successful",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Cash Out
export const cashOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, amount, pin, agentId } = req.body;

    if (amount <= 0) {
      res.status(400).json({ message: "Amount must be greater than zero" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isValidPin = await bcrypt.compare(pin, user.pin);
    if (!isValidPin) {
      res.status(400).json({ message: "Invalid PIN" });
      return;
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "Agent" || !agent.isApproved) {
      res.status(400).json({ message: "Agent not found or not authorized" });
      return;
    }

    const fee = amount * 0.015;
    const agentCommission = amount * 0.01;
    const adminCommission = amount * 0.005;

    if (user.balance < amount + fee) {
      res.status(400).json({ message: "Insufficient user balance" });
      return;
    }

    if (agent.balance < amount) {
      res
        .status(400)
        .json({ message: "Agent has insufficient funds to process cash-out" });
      return;
    }

    user.balance -= amount + fee;
    await user.save();

    agent.balance = agent.balance - amount + agentCommission;
    await agent.save();

    const admin = await User.findOne({ role: "Admin" });
    if (admin) {
      admin.balance += adminCommission;
      await admin.save();
    }

    const transaction = await Transaction.create({
      sender: user._id,
      receiver: agent._id,
      amount,
      type: TransactionType.CASH_OUT,
      fee,
    });

    res.status(200).json({
      message: "Cash-out successful",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Cash In
export const cashIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, agentId, amount, agentPin } = req.body;

    if (amount <= 0) {
      res.status(400).json({ message: "Amount must be greater than zero" });
      return;
    }

    // Verify agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "Agent" || !agent.isApproved) {
      res.status(400).json({ message: "Agent not found or not authorized" });
      return;
    }
    const isValidAgentPin = await bcrypt.compare(agentPin, agent.pin);
    if (!isValidAgentPin) {
      res.status(400).json({ message: "Invalid agent PIN" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Increase user's balance by the cash-in amount
    user.balance += amount;
    agent.balance -= amount;
    await user.save();
    await agent.save();

    // Optionally: If needed, update system totals here

    // Record the transaction (no fee)
    const transaction = await Transaction.create({
      sender: agent._id, // Agent facilitates the cash-in
      receiver: user._id,
      amount,
      type: TransactionType.CASH_IN,
      fee: 0,
    });

    // Optionally: Send notification to the user
    res.status(200).json({
      message: "Cash-in successful",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const TransactionController = {
  sendMoney,
  cashOut,
  cashIn,
};
