import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            minlength: [3, "Category name must be at least 3 characters long"],
            maxlength: [50, "Category name cannot exceed 50 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Category description cannot exceed 500 characters"],
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isDelete: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);

export type CategoryDocument = ICategory;
