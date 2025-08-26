import { Request, Response } from "express";
import { Types } from "mongoose";
import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { adminRole, roleDefault } from "../constants/role.constant";
import { Logger } from "../utils/logger.util";
import { StatusResponse } from "../common/status-response.common";

export class RoleService {
  private roleModel = Role;
  private permissionModel = Permission;
  private logger = new Logger('RoleService');

  async initPackageEntity() {
    try {
      for (const data of roleDefault) {
        const existingRole = await this.roleModel.findById(
          new Types.ObjectId(data._id)
        );
        if (!existingRole) {
          await this.roleModel.create(data);
        }
      }
    } catch (error) {
      this.logger.error("❌ Không thể khởi tạo data cho role entity", error);
    }
  }

  async checkRole(name: string) {
    return this.roleModel.findOne({ name });
  }

  async checkRoleById(id: string) {
    if (id === adminRole) {
      throw {
        status: 403,
        message: `You Don't Have Permission To Change Admin Role`,
      };
    }
    return this.roleModel.findById(new Types.ObjectId(id));
  }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const checkRole = await this.roleModel.findOne({ name });
      if (checkRole) {
        return res.status(400).json({
          status: StatusResponse.FAIL,
          message: "Already Exist Role"
        });
      }

      const role = await this.roleModel.create({ name });
      this.logger.info(`Role created: ${role.name}`);

      return res.status(201).json({
        status: StatusResponse.SUCCESS,
        message: "Create Role Success",
        data: role,
      });
    } catch (error) {
      this.logger.error('Create role error:', error);
      return res.status(500).json({
        status: StatusResponse.FAIL,
        message: 'Internal server error'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (id === adminRole) {
        return res.status(403).json({
          status: StatusResponse.FORBIDDEN,
          message: `You Don't Have Permission To Change Admin Role`
        });
      }

      const role = await this.roleModel.findById(new Types.ObjectId(id));
      if (!role) {
        return res.status(400).json({
          status: StatusResponse.NOTFOUND,
          message: "Role By Id Is Not Exists"
        });
      }

      const checkName = await this.roleModel.findOne({ name, _id: { $ne: id } });
      if (checkName) {
        return res.status(400).json({
          status: StatusResponse.FAIL,
          message: "Role Name Already Exists"
        });
      }

      role.name = name;
      await role.save();

      this.logger.info(`Role updated: ${role.name}`);

      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Update Role Success",
        data: role,
      });
    } catch (error) {
      this.logger.error('Update role error:', error);
      return res.status(500).json({
        status: StatusResponse.FAIL,
        message: 'Internal server error'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (id === adminRole) {
        return res.status(403).json({
          status: StatusResponse.FORBIDDEN,
          message: "You Don't Have Permission To Delete Admin Role"
        });
      }

      const role = await this.roleModel.findByIdAndDelete(new Types.ObjectId(id));
      if (!role) {
        return res.status(400).json({
          status: StatusResponse.NOTFOUND,
          message: "Role By Id Not Exists"
        });
      }

      await this.permissionModel.deleteMany({ role: new Types.ObjectId(id) });

      this.logger.info(`Role deleted: ${role.name}`);

      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Role Deleted Successfully!",
      });
    } catch (error) {
      this.logger.error('Delete role error:', error);
      return res.status(500).json({
        status: StatusResponse.FAIL,
        message: 'Internal server error'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await this.roleModel.findById(new Types.ObjectId(id));
      if (!role) {
        return res.status(400).json({
          status: StatusResponse.NOTFOUND,
          message: "Role By Id Is Not Exists"
        });
      }

      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Get Role By Id Success",
        data: role,
      });
    } catch (error) {
      this.logger.error('Get role by ID error:', error);
      return res.status(500).json({
        status: StatusResponse.FAIL,
        message: 'Internal server error'
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const roles = await this.roleModel.find();
      return res.json({
        status: StatusResponse.SUCCESS,
        message: "Get List Role successfully",
        data: roles,
      });
    } catch (error) {
      this.logger.error('Get all roles error:', error);
      return res.status(500).json({
        status: StatusResponse.FAIL,
        message: 'Internal server error'
      });
    }
  }
}
