import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
            minlength: [3, "Category name must be at least 3 characters long"],
            maxlength: [50, "Category name cannot exceed 50 characters"],
        },
    },
    {
        timestamps: true,
    }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);

export type CategoryDocument = ICategory;
