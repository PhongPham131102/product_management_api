import mongoose, { Document, Schema, Types } from "mongoose";

export enum PaymentStatusEnum {
    UNPAID = 0,
    PAID = 1,
    REFUNDED = 2
}

export enum OrderStatusEnum {
    PLACED = 0,
    CONFIRMED = 1,
    SHIPPING = 2,
    COMPLETED = 3,
    CANCELLED = 4
}

export interface IInvoiceItem {
    product: Types.ObjectId;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    subtotal: number;
}

export interface IInvoice extends Document {
    _id: mongoose.Types.ObjectId;
    createdBy: Types.ObjectId;
    customer: Types.ObjectId;
    items: IInvoiceItem[];
    totalQuantity: number;
    totalAmount: number;
    orderCode: string;
    orderDate: Date;
    note?: string;
    paymentStatus: PaymentStatusEnum;
    orderStatus: OrderStatusEnum;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new Schema<IInvoice>({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [invoiceItemSchema], required: true },
    totalQuantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    orderCode: { type: String, required: true, unique: true, trim: true },
    orderDate: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 1000 },
    paymentStatus: { type: Number, enum: [0, 1, 2], default: 0 },
    orderStatus: { type: Number, enum: [0, 1, 2, 3, 4], default: 0 },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true });

invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ paymentStatus: 1, createdAt: -1 });
invoiceSchema.index({ orderStatus: 1, createdAt: -1 });
invoiceSchema.index({ isDelete: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export type InvoiceDocument = IInvoice;


