
import { Product } from '../models/product.model';
import { Invoice, PaymentStatusEnum, OrderStatusEnum } from '../models/invoice.model';

export class DashboardService {
    async getSummary() {
        const [totalProducts, stockAgg, lowStock, revenueAgg, pendingOrders] = await Promise.all([
            Product.countDocuments({ isDelete: false }),
            Product.aggregate([
                { $match: { isDelete: false } },
                { $group: { _id: null, total: { $sum: '$quantity' } } },
            ]),
            Product.countDocuments({ isDelete: false, $expr: { $lte: ['$quantity', '$reorderLevel'] } }),
            Invoice.aggregate([
                { $match: { isDelete: false, paymentStatus: PaymentStatusEnum.PAID } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Invoice.countDocuments({ isDelete: false, orderStatus: { $in: [OrderStatusEnum.PLACED, OrderStatusEnum.CONFIRMED, OrderStatusEnum.SHIPPING] } }),
        ]);

        return {
            totalProducts,
            totalStock: stockAgg[0]?.total || 0,
            lowStock,
            revenue: revenueAgg[0]?.total || 0,
            pendingOrders,
        };
    }

    async getMonthlyRevenue(year?: number) {
        const now = new Date();
        const y = year || now.getFullYear();
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);

        const data = await Invoice.aggregate([
            { $match: { isDelete: false, paymentStatus: PaymentStatusEnum.PAID, orderDate: { $gte: start, $lt: end } } },
            { $group: { _id: { m: { $month: '$orderDate' } }, total: { $sum: '$totalAmount' } } },
            { $project: { _id: 0, month: '$_id.m', total: 1 } },
            { $sort: { month: 1 } },
        ]);

        // Build 12 months array
        const result: { month: number; total: number }[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));
        for (const row of data as Array<{ month?: number; total?: number }>) {
            const m = typeof row.month === 'number' ? row.month : 0;
            if (m >= 1 && m <= 12) {
                const idx = m - 1;
                result[idx]!.total = Number(row.total ?? 0);
            }
        }
        return { year: y, data: result };
    }

    async getLowStock(limit = 10) {
        const products = await Product.find({ isDelete: false, $expr: { $lte: ['$quantity', '$reorderLevel'] } })
            .select('name quantity')
            .sort({ quantity: 1 })
            .limit(limit);
        return products.map(p => ({ name: p.name, quantity: p.quantity }));
    }

    async getStockOverview(limit = 50) {
        const products = await Product.find({ isDelete: false })
            .select('name quantity reorderLevel status price')
            .sort({ updatedAt: -1 })
            .limit(limit);
        return products.map(p => ({
            name: p.name,
            stock: p.quantity,
            reorderLevel: p.reorderLevel,
            status: p.status,
            price: p.price,
        }));
    }

    async getRecentOrders(limit = 10) {
        const invoices = await Invoice.find({ isDelete: false })
            .select('orderCode items totalQuantity orderStatus createdAt')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return invoices.map(inv => ({
            orderCode: inv.orderCode,
            product: inv.items?.[0]?.nameSnapshot || 'N/A',
            quantity: inv.items?.[0]?.quantity || 0,
            status: inv.orderStatus,
            createdAt: inv.createdAt,
        }));
    }
}


