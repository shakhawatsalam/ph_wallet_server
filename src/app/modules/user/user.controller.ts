import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "./user.models";
import { IUser } from "./user.interface";
import { generateTokenAndSetCookie } from "../../../utils/generateTokenAndSetCookie";
const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, mobileNumber, pin, nid, role } = req.body;

    if (!name || !email || !mobileNumber || !pin || !nid || !role) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }, { nid }],
    });
    if (existingUser) {
      res.status(400).json({
        message:
          "User with provided email, mobile number, or nid already exists.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const newUser: IUser = await User.create({
      name,
      email,
      mobileNumber,
      pin: hashedPin,
      nid,
      role,
    });

    res.status(201).json({
      message: "User registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
        balance: newUser.balance,
        isApproved: newUser.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier, pin } = req.body; // identifier can be email or mobileNumber

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const approveAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "Agent") {
      return res.status(400).json({ message: "Only agents can be approved" });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      message: "Agent approved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  registerUser,
  login,
  logout,
  approveAgent,
};
