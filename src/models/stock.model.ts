import mongoose, { Document, Schema } from "mongoose";

export interface IStock extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    stock: number;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
    {
        name: {
            type: String,
            required: [true, "Stock name is required"],
            trim: true,
            minlength: [2, "Stock name must be at least 2 characters long"],
            maxlength: [100, "Stock name cannot exceed 100 characters"],
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: [0, "Stock quantity cannot be negative"],
            default: 0,
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
stockSchema.index({ name: 1 });
stockSchema.index({ isDelete: 1 });

export const Stock = mongoose.model<IStock>("Stock", stockSchema);

export type StockDocument = IStock;
