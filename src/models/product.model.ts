import mongoose, { Document, Schema, Types } from "mongoose";
import { CategoryDocument } from "./category.model";
import { StockDocument } from "./stock.model";

export enum ProductStatusEnum {
    IN_STOCK = 0,      // Còn hàng
    LOW_STOCK = 1,     // Sắp hết hàng
    OUT_OF_STOCK = 2   // Hết hàng
}

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    sku: string;
    unit: string;
    description: string;
    price: number;
    originalPrice: number;
    quantity: number;
    reorderLevel: number;
    status: ProductStatusEnum;
    categories: CategoryDocument[] | Types.ObjectId[];
    stock: StockDocument | Types.ObjectId;
    imageUrl: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters long"],
            maxlength: [100, "Product name cannot exceed 100 characters"],
        },
        sku: {
            type: String,
            required: [true, "Product SKU is required"],
            trim: true,
            unique: true,
            minlength: [3, "Product SKU must be at least 3 characters long"],
            maxlength: [50, "Product SKU cannot exceed 50 characters"],
        },
        unit: {
            type: String,
            required: [true, "Product unit is required"],
            trim: true,
            minlength: [1, "Product unit must be at least 1 character long"],
            maxlength: [20, "Product unit cannot exceed 20 characters"],
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minlength: [10, "Product description must be at least 10 characters long"],
            maxlength: [1000, "Product description cannot exceed 1000 characters"],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Product price cannot be negative"],
        },
        originalPrice: {
            type: Number,
            required: [true, "Product original price is required"],
            min: [0, "Product original price cannot be negative"],
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
            min: [0, "Product quantity cannot be negative"],
            default: 0,
        },
        reorderLevel: {
            type: Number,
            required: [true, "Product reorder level is required"],
            min: [0, "Product reorder level cannot be negative"],
            default: 0,
        },
        status: {
            type: Number,
            enum: [0, 1, 2],
            default: 0,
        },
        categories: [{
            type: Types.ObjectId,
            ref: 'Category',
            required: [true, "At least one category is required"],
        }],
        stock: {
            type: Types.ObjectId,
            ref: 'Stock',
            required: [true, "Stock reference is required"],
        },
        imageUrl: {
            type: String,
            trim: true,
            maxlength: [500, "Image URL cannot exceed 500 characters"],
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
productSchema.index({ name: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ isDelete: 1 });
productSchema.index({ price: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ status: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ stock: 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);

export type ProductDocument = IProduct;
