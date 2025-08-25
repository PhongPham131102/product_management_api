import mongoose, { Document, Schema, Types } from "mongoose";
import { RoleDocument } from "./role.model";

export enum ActionEnum {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
}

export enum SubjectEnum {
  ALL = "all",
  USER = "user",
  VIDEO = "video",
  ROLE = "role",
  TEAM = "team",
  LOG = "log",
  TOKEN = "token",
}

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId;
  role: RoleDocument | Types.ObjectId;
  action: ActionEnum[];
  subject: SubjectEnum;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: true,
    },
    action: {
      type: [String],
      enum: Object.values(ActionEnum),
      required: true,
      default: [],
    },
    subject: {
      type: String,
      enum: Object.values(SubjectEnum),
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const Permission = mongoose.model<IPermission>(
  "Permission",
  permissionSchema
);

export type PermissionDocument = IPermission;
