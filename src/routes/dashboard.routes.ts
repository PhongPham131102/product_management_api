import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorization } from '../middleware/authorization.middleware';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const controller = new DashboardController();

// Summary cards
router.get('/summary', authenticateToken, authorization(SubjectEnum.ALL, ActionEnum.READ), controller.summary.bind(controller));

// Charts
router.get('/monthly-revenue', authenticateToken, authorization(SubjectEnum.ALL, ActionEnum.READ), controller.monthlyRevenue.bind(controller));
router.get('/low-stock', authenticateToken, authorization(SubjectEnum.ALL, ActionEnum.READ), controller.lowStock.bind(controller));

// Tables
router.get('/stock-overview', authenticateToken, authorization(SubjectEnum.ALL, ActionEnum.READ), controller.stockOverview.bind(controller));
router.get('/recent-orders', authenticateToken, authorization(SubjectEnum.ALL, ActionEnum.READ), controller.recentOrders.bind(controller));

export default router;


