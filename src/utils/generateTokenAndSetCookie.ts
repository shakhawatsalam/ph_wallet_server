import jwt from "jsonwebtoken";

import { Response } from "express";
import config from "../app/config";

export const generateTokenAndSetCookie = (res: Response, userId: string) => {
  if (!config.jwt_secret) {
    throw new Error("JWT secret is not defined in config");
  }
  const token = jwt.sign({ userId }, config.jwt_secret, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};
