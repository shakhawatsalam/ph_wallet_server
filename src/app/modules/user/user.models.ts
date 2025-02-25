import mongoose, { Schema, model } from "mongoose";
import { IUser, Role } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pin: {
      type: String,
      required: true,
    },
    nid: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    balance: {
      type: Number,
      default: function (this: IUser) {
        if (this.role === Role.User) return 40;
        if (this.role === Role.Agent) return 100000;
        return 0;
      },
    },
    isApproved: {
      type: Boolean,
      default: function (this: IUser) {
        return this.role === Role.Agent ? false : undefined;
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
