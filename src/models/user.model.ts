import mongoose, { Document, Schema, Types } from "mongoose";
import { RoleDocument } from "./role.model";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password?: string;
  name: string;
  email?: string;
  role: RoleDocument;
  isDelete: boolean;
  refresh_token: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      sparse: true,
    },
    role: {
      type: Types.ObjectId,
      ref: 'Role',
      required: [true, "Role is required"],
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    refresh_token: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);

export type UserDocument = IUser;