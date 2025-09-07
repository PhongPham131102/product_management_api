import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { validateQuery } from '../middleware/validate-query.middleware';
import { CreateStockDto } from '../dto/stocks/create-stock.dto';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { UpdateStockDto } from '../dto/stocks/update-stock.dto';
import { StockQueryDto } from '../dto/stocks/stock-query.dto';

const router = Router();
const stockController = new StockController();


router.get('/',
    authorization(SubjectEnum.STOCK, ActionEnum.READ),
    validateQuery(StockQueryDto),
    (req, res) => stockController.getAllStocks(req, res)
);


router.get('/:id',
    authorization(SubjectEnum.STOCK, ActionEnum.READ),
    (req, res) => stockController.getStockById(req, res)
);


router.get('/status/:status',
    authorization(SubjectEnum.STOCK, ActionEnum.READ),
    (req, res) => stockController.getStocksByStatus(req, res)
);


router.get('/low-stock/items',
    authorization(SubjectEnum.STOCK, ActionEnum.READ),
    (req, res) => stockController.getLowStockItems(req, res)
);


router.post('/',
    authorization(SubjectEnum.STOCK, ActionEnum.CREATE),
    validateDto(CreateStockDto),
    (req, res) => stockController.createStock(req, res)
);


router.put('/:id',
    authorization(SubjectEnum.STOCK, ActionEnum.UPDATE),
    validateDto(UpdateStockDto),
    (req, res) => stockController.updateStock(req, res)
);

router.delete('/:id',
    authorization(SubjectEnum.STOCK, ActionEnum.DELETE),
    (req, res) => stockController.deleteStock(req, res)
);

router.patch('/update-statuses',
    authorization(SubjectEnum.STOCK, ActionEnum.UPDATE),
    (req, res) => stockController.updateStockStatuses(req, res)
);

export default router;
