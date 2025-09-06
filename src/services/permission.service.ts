
import { Logger } from '../utils/logger.util';
import { Permission } from '../models/permission.model';
import { StatusResponse } from '../common/status-response.common';
import { FilterQuery, Types } from 'mongoose';
import { PermissionDocument } from '../models/permission.model';
export class PermissionService {
    private logger = new Logger('PermissionService');
    async findOneBy(filter: FilterQuery<PermissionDocument>) {
        const result = await Permission.findOne(filter);
        return result
    }
    async getPermissionByRole(roleId: Types.ObjectId) {
        const result = await Permission.find({ role: roleId }).populate('role', 'name');
        return result
    }
}