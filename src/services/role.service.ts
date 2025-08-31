import { Types } from "mongoose";
import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { adminRole, roleDefault } from "../constants/role.constant";
import { Logger } from "../utils/logger.util";
import { StatusResponse } from "../common/status-response.common";
import { HttpException } from "../exceptions/http-exception.exception";

export class RoleService {
    private roleModel = Role;
    private permissionModel = Permission;
    private logger = new Logger('RoleService');

    async initPackageEntity(): Promise<void> {
        try {
            for (const data of roleDefault) {
                const existingRole = await this.roleModel.findById(new Types.ObjectId(data._id));
                if (!existingRole) {
                    await this.roleModel.create(data);
                }
            }
            this.logger.verbose('Khởi tạo data cho role entity thành công');
        } catch (error) {
            this.logger.error('Không thể khởi tạo data cho role entity', error);
            throw error;
        }
    }

    async checkRole(name: string) {
        return this.roleModel.findOne({ name });
    }

    async checkRoleById(id: string) {
        if (id === adminRole) {
            throw new HttpException({
                status: 403,
                error_code: StatusResponse.FORBIDDEN,
                message: `You Don't Have Permission To Change Admin Role`
            });
        }
        return this.roleModel.findById(new Types.ObjectId(id));
    }

    async createRole(name: string) {
        const checkRole = await this.roleModel.findOne({ name });
        if (checkRole) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.ROLE_ALREADY_EXISTS,
                message: 'Already Exist Role'
            });
        }
        const role = await this.roleModel.create({ name });
        this.logger.verbose(`Role created: ${role.name}`);
        return role;
    }

    async updateRole(id: string, name: string) {
        if (id === adminRole) {
            throw new HttpException({
                status: 403,
                error_code: StatusResponse.FORBIDDEN,
                message: `You Don't Have Permission To Change Admin Role`
            });
        }

        const role = await this.roleModel.findById(new Types.ObjectId(id));
        if (!role) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.ROLE_BY_ID_NOT_FOUND,
                message: 'Role By Id Is Not Exists'
            });
        }

        const checkName = await this.roleModel.findOne({ name, _id: { $ne: id } });
        if (checkName) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.ROLE_NAME_ALREADY_EXISTS,
                message: 'Role Name Already Exists'
            });
        }

        role.name = name;
        await role.save();
        this.logger.verbose(`Role updated: ${role.name}`);
        return role;
    }

    async deleteRole(id: string) {
        if (id === adminRole) {
            throw new HttpException({
                status: 403,
                error_code: StatusResponse.FORBIDDEN,
                message: `You Don't Have Permission To Delete Admin Role`
            });
        }

        const role = await this.roleModel.findByIdAndDelete(new Types.ObjectId(id));
        if (!role) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.ROLE_BY_ID_NOT_FOUND,
                message: 'Role By Id Not Exists'
            });
        }

        await this.permissionModel.deleteMany({ role: new Types.ObjectId(id) });
        this.logger.verbose(`Role deleted: ${role.name}`);
        return true;
    }

    async getRoleById(id: string) {
        const role = await this.roleModel.findById(new Types.ObjectId(id));
        if (!role) {
            throw new HttpException({ status: 400, error_code: StatusResponse.ROLE_BY_ID_NOT_FOUND, message: 'Role By Id Is Not Exists' });
        }
        return role;
    }

    async getAllRoles() {
        const roles = await this.roleModel.find();
        return roles;
    }
}

export default RoleService;


