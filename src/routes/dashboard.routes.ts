import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const controller = new DashboardController();

// Summary cards
router.get('/summary', authenticateToken,  controller.summary.bind(controller));

// Charts
router.get('/monthly-revenue', authenticateToken,  controller.monthlyRevenue.bind(controller));
router.get('/low-stock', authenticateToken,  controller.lowStock.bind(controller));

// Tables
router.get('/stock-overview', authenticateToken,  controller.stockOverview.bind(controller));
router.get('/recent-orders', authenticateToken,  controller.recentOrders.bind(controller));

export default router;


