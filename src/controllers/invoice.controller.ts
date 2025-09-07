import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { StatusResponse } from '../common/status-response.common';
import { HttpException } from '../exceptions/http-exception.exception';
import { CreateInvoiceDto } from '../dto/invoices/create-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoices/invoice-query.dto';
import { UpdateInvoiceStatusDto } from '../dto/invoices/update-invoice-status.dto';

export class InvoiceController {
    private invoiceService = new InvoiceService();

    async getAllInvoices(req: Request, res: Response) {
        try {
            const queryDto: InvoiceQueryDto = req.query as any;
            const result = await this.invoiceService.getAllInvoices(queryDto);
            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Invoices retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getInvoiceById(req: Request, res: Response) {
        try {
            const { id = "" } = req.params;
            const invoice = await this.invoiceService.getInvoiceById(id);
            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Invoice retrieved successfully',
                data: invoice
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async createInvoice(req: Request, res: Response) {
        try {
            const dto: CreateInvoiceDto = req.body;
            const creatorId = (req as any).user?._id?.toString();
            const invoice = await this.invoiceService.createInvoice(dto, creatorId);
            return res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Invoice created successfully',
                data: invoice
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateInvoiceStatus(req: Request, res: Response) {
        try {
            const { id = "" } = req.params;
            const body: UpdateInvoiceStatusDto = req.body;
            const invoice = await this.invoiceService.updateInvoiceStatus(id, body);
            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Invoice status updated successfully',
                data: invoice
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteInvoice(req: Request, res: Response) {
        try {
            const { id = "" } = req.params;
            await this.invoiceService.deleteInvoice(id);
            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Invoice deleted successfully'
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }
}


