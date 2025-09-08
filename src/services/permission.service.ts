import { Permission } from '../models/permission.model';
import { FilterQuery, Types } from 'mongoose';
import { PermissionDocument } from '../models/permission.model';
export class PermissionService {

    async findOneBy(filter: FilterQuery<PermissionDocument>) {
        const result = await Permission.findOne(filter);
        return result
    }
    async getPermissionByRole(roleId: Types.ObjectId) {
        const result = await Permission.find({ role: roleId }).populate('role', 'name');
        return result
    }
}