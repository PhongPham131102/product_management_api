import { Types } from "mongoose";
import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { adminRole, roleDefault } from "../constants/role.constant";


export class RoleService {  
  private roleModel = Role;
  private permissionModel = Permission;

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
      console.error("❌ Không thể khởi tạo data cho role entity", error);
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

  async create(createRoleDto: { name: string }) {
    const { name } = createRoleDto;
    const checkRole = await this.roleModel.findOne({ name });
    if (checkRole) {
      throw { status: 400, message: "Already Exist Role" };
    }

    const role = await this.roleModel.create(createRoleDto);
    return {
      status: "success",
      message: "Create Role Success",
      data: role,
    };
  }

  async update(id: string, updateRoleDto: { name: string }) {
    if (id === adminRole) {
      throw { status: 403, message: `You Don't Have Permission To Change Admin Role` };
    }

    const role = await this.roleModel.findById(new Types.ObjectId(id));
    if (!role) {
      throw { status: 400, message: "Role By Id Is Not Exists" };
    }

    const checkName = await this.roleModel.findOne({ name: updateRoleDto.name });
    if (checkName) {
      throw { status: 400, message: "Role Name Already Exists" };
    }

    role.name = updateRoleDto.name;
    await role.save();

    return {
      status: "success",
      message: "Update Role Success",
      data: role,
    };
  }

  async delete(id: string) {
    if (id === adminRole) {
      throw { status: 403, message: "You Don't Have Permission To Delete Admin Role" };
    }

    const role = await this.roleModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!role) {
      throw { status: 400, message: "Role By Id Not Exists" };
    }

    await this.permissionModel.deleteMany({ role: new Types.ObjectId(id) });

    return {
      status: "success",
      message: "Role Deleted Successfully!",
    };
  }

  async getById(id: string) {
    const role = await this.roleModel.findById(new Types.ObjectId(id));
    if (!role) {
      throw { status: 400, message: "Role By Id Is Not Exists" };
    }

    return {
      status: "success",
      message: "Get Role By Id Success",
      data: role,
    };
  }

  async getAll() {
    const roles = await this.roleModel.find();
    return {
      status: "success",
      message: "Get List Role successfully",
      data: roles,
    };
  }
}
