import { Request, Response } from "express";
import { StatusResponse } from "../common/status-response.common";
import RoleService from "../services/role.service";
import { HttpException } from "../exceptions/http-exception.exception";

export class RoleController {
  private service = new RoleService();

  async initPackageEntity() { return this.service.initPackageEntity(); }

  async checkRole(name: string) { return this.service.checkRole(name); }

  async checkRoleById(id: string) { return this.service.checkRoleById(id); }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const role = await this.service.createRole(name);

      return res.status(201).json({
        status: StatusResponse.SUCCESS,
        message: "Create Role Success",
        data: role,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error
      const status = (error as any).status || 500;
      return res.status(status).json({
        status: StatusResponse.FAIL,
        message: (error as any).message || 'Internal server error'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id = "" } = req.params;
      const { name } = req.body;
      const role = await this.service.updateRole(id, name);

      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Update Role Success",
        data: role,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error
      const status = (error as any).status || 500;
      return res.status(status).json({
        status: StatusResponse.FAIL,
        message: (error as any).message || 'Internal server error'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id = "" } = req.params;
      await this.service.deleteRole(id);

      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Role Deleted Successfully!",
      });
    } catch (error) {
      if (error instanceof HttpException) throw error
      const status = (error as any).status || 500;
      return res.status(status).json({
        status: StatusResponse.FAIL,
        message: (error as any).message || 'Internal server error'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id = "" } = req.params;
      const role = await this.service.getRoleById(id);
      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Get Role By Id Success",
        data: role,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error
      const status = (error as any).status || 500;
      return res.status(status).json({
        status: StatusResponse.FAIL,
        message: (error as any).message || 'Internal server error'
      });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const roles = await this.service.getAllRoles();
      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Get List Role successfully",
        data: roles,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error
      const status = (error as any).status || 500;
      return res.status(status).json({
        status: StatusResponse.FAIL,
        message: (error as any).message || 'Internal server error'
      });
    }
  }
}
