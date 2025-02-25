import { Document } from "mongoose";
export enum Role {
  User = "User",
  Agent = "Agent",
  Admin = "Admin",
}

export interface IUser extends Document {
  name: string;
  pin: string;
  mobileNumber: string;
  email: string;
  nid: string;
  role: Role;
  balance: number;
  isApproved?: boolean;
}
