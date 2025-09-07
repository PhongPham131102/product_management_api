import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { validateQuery } from '../middleware/validate-query.middleware';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { CreateInvoiceDto } from '../dto/invoices/create-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoices/invoice-query.dto';
import { UpdateInvoiceStatusDto } from '../dto/invoices/update-invoice-status.dto';

const router = Router();
const invoiceController = new InvoiceController();

router.get('/',
    authorization(SubjectEnum.INVOICE as any, ActionEnum.READ),
    validateQuery(InvoiceQueryDto),
    (req, res) => invoiceController.getAllInvoices(req, res)
);

router.get('/:id',
    authorization(SubjectEnum.INVOICE as any, ActionEnum.READ),
    (req, res) => invoiceController.getInvoiceById(req, res)
);

router.post('/',
    authorization(SubjectEnum.INVOICE as any, ActionEnum.CREATE),
    validateDto(CreateInvoiceDto),
    (req, res) => invoiceController.createInvoice(req, res)
);

router.put('/:id/status',
    authorization(SubjectEnum.INVOICE as any, ActionEnum.UPDATE),
    validateDto(UpdateInvoiceStatusDto),
    (req, res) => invoiceController.updateInvoiceStatus(req, res)
);

router.delete('/:id',
    authorization(SubjectEnum.INVOICE as any, ActionEnum.DELETE),
    (req, res) => invoiceController.deleteInvoice(req, res)
);

export default router;


