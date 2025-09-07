import { Types } from 'mongoose';
import { Invoice, PaymentStatusEnum, OrderStatusEnum } from '../models/invoice.model';
import { Product, ProductStatusEnum } from '../models/product.model';
import { User } from '../models/user.model';
// import { Logger } from '../utils/logger.util';
import { CreateInvoiceDto } from '../dto/invoices/create-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoices/invoice-query.dto';
import { UpdateInvoiceStatusDto } from '../dto/invoices/update-invoice-status.dto';
import { HttpException } from '../exceptions/http-exception.exception';
import { StatusResponse } from '../common/status-response.common';

export class InvoiceService {

    async getAllInvoices(queryDto: InvoiceQueryDto = {}) {
        const {
            page = 1,
            limit = 10,
            user,
            paymentStatus,
            orderStatus,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryDto;

        const filter: any = { isDelete: false };
        if (user) filter.customer = new Types.ObjectId(user);
        if (paymentStatus !== undefined) filter.paymentStatus = paymentStatus;
        if (orderStatus !== undefined) filter.orderStatus = orderStatus;

        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            Invoice.find(filter)
                .populate('createdBy', 'username name')
                .populate('customer', 'username name')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Invoice.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: invoices,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        };
    }

    async createInvoice(dto: CreateInvoiceDto, createdById: string) {
        // KHÔNG dùng transaction để hỗ trợ MongoDB standalone
        try {
            const creator = await User.findOne({ _id: createdById, isDelete: false });
            if (!creator) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.INVOICE_CREATOR_NOT_FOUND,
                    message: 'Creator not found'
                });
            }
            const customer = await User.findOne({ _id: dto.customer, isDelete: false });
            if (!customer) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.INVOICE_CUSTOMER_NOT_FOUND,
                    message: 'Customer not found'
                });
            }

            if (!dto.items || dto.items.length === 0) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.INVOICE_EMPTY_ITEMS,
                    message: 'Invoice must contain at least one item'
                });
            }

            // Validate products and stock, compute totals
            const productIds = dto.items.map(i => new Types.ObjectId(i.product));
            const products = await Product.find({ _id: { $in: productIds }, isDelete: false });
            const idToProduct = new Map(products.map(p => [p._id.toString(), p]));

            let totalQuantity = 0;
            let totalAmount = 0;
            const items = [] as any[];

            for (const item of dto.items) {
                const p = idToProduct.get(item.product);
                if (!p) {
                    throw new HttpException({
                        status: 400,
                        error_code: StatusResponse.PRODUCT_NOT_FOUND,
                        message: `Product not found: ${item.product}`
                    });
                }
                if (p.quantity < item.quantity) {
                    throw new HttpException({
                        status: 400,
                        error_code: StatusResponse.INSUFFICIENT_PRODUCT_STOCK,
                        message: `Insufficient stock for product ${p.name}`
                    });
                }

                const subtotal = p.price * item.quantity;
                totalQuantity += item.quantity;
                totalAmount += subtotal;

                items.push({
                    product: p._id,
                    nameSnapshot: p.name,
                    priceSnapshot: p.price,
                    quantity: item.quantity,
                    subtotal
                });
            }

            // Deduct stock with compensation (no transaction)
            const decremented: Array<{ productId: string; quantity: number }> = [];
            try {
                for (const item of dto.items) {
                    const updated = await Product.findOneAndUpdate(
                        { _id: item.product, isDelete: false, quantity: { $gte: item.quantity } },
                        { $inc: { quantity: -item.quantity } },
                        { new: true }
                    );
                    if (!updated) {
                        throw new HttpException({
                            status: 400,
                            error_code: StatusResponse.INVOICE_STOCK_CHANGED,
                            message: 'Stock changed during checkout. Please retry.'
                        });
                    }
                    decremented.push({ productId: item.product, quantity: item.quantity });

                    // Update status based on remaining quantity
                    const newStatus = updated.quantity === 0
                        ? ProductStatusEnum.OUT_OF_STOCK
                        : (updated.quantity <= updated.reorderLevel ? ProductStatusEnum.LOW_STOCK : ProductStatusEnum.IN_STOCK);
                    if (updated.status !== newStatus) {
                        updated.status = newStatus;
                        await updated.save();
                    }
                }
            } catch (err) {
                // Compensation: revert any decremented items
                for (const d of decremented) {
                    const reverted = await Product.findOneAndUpdate(
                        { _id: d.productId, isDelete: false },
                        { $inc: { quantity: d.quantity } },
                        { new: true }
                    );
                    if (reverted) {
                        const newStatus = reverted.quantity === 0
                            ? ProductStatusEnum.OUT_OF_STOCK
                            : (reverted.quantity <= reverted.reorderLevel ? ProductStatusEnum.LOW_STOCK : ProductStatusEnum.IN_STOCK);
                        if (reverted.status !== newStatus) {
                            reverted.status = newStatus;
                            await reverted.save();
                        }
                    }
                }
                throw err;
            }

            const orderCode = `#${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
            const invoice = new Invoice({
                createdBy: creator._id,
                customer: customer._id,
                items,
                totalQuantity,
                totalAmount,
                orderCode,
                orderDate: new Date(),
                note: dto.note || '',
                paymentStatus: PaymentStatusEnum.UNPAID,
                orderStatus: OrderStatusEnum.PLACED
            });
            await invoice.save();

            return invoice;
        } catch (error) {
            throw error;
        }
    }

    async updateInvoiceStatus(id: string, body: UpdateInvoiceStatusDto) {
        try {
            const invoice = await Invoice.findOne({ _id: id, isDelete: false });
            if (!invoice) {
                throw new HttpException({
                    status: 404,
                    error_code: StatusResponse.INVOICE_NOT_FOUND,
                    message: 'Invoice not found'
                });
            }

            // If cancelling while order not completed => restock
            if (invoice.orderStatus !== OrderStatusEnum.COMPLETED && body.orderStatus === OrderStatusEnum.CANCELLED) {
                for (const item of invoice.items) {
                    const updated = await Product.findOneAndUpdate(
                        { _id: item.product, isDelete: false },
                        { $inc: { quantity: item.quantity } },
                        { new: true }
                    );
                    if (updated) {
                        const newStatus = updated.quantity === 0
                            ? ProductStatusEnum.OUT_OF_STOCK
                            : (updated.quantity <= updated.reorderLevel ? ProductStatusEnum.LOW_STOCK : ProductStatusEnum.IN_STOCK);
                        if (updated.status !== newStatus) {
                            updated.status = newStatus;
                            await updated.save();
                        }
                    }
                }
            }

            if (body.paymentStatus !== undefined) invoice.paymentStatus = body.paymentStatus as any;
            if (body.orderStatus !== undefined) invoice.orderStatus = body.orderStatus as any;
            await invoice.save();
            return invoice;
        } catch (error) {
            throw error;
        }
    }

    async getInvoiceById(id: string) {
        const invoice = await Invoice.findOne({ _id: id, isDelete: false })
            .populate('createdBy', 'username name')
            .populate('customer', 'username name');
        if (!invoice) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.INVOICE_NOT_FOUND,
                message: 'Invoice not found'
            });
        }
        return invoice;
    }

    async deleteInvoice(id: string) {
        const invoice = await Invoice.findOne({ _id: id, isDelete: false });
        if (!invoice) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.INVOICE_NOT_FOUND,
                message: 'Invoice not found'
            });
        }
        invoice.isDelete = true;
        await invoice.save();
        return true;
    }
}


