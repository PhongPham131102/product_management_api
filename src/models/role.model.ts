import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Role name must be at least 3 characters long"],
      maxlength: [50, "Role name cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true, 
  }
);

roleSchema.index({ name: 1 });

export const Role = mongoose.model<IRole>("Role", roleSchema);

export type RoleDocument = IRole;
