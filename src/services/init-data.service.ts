import { RoleController } from '../controllers/role.controller';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { usersDefault, permisstionDefault } from '../constants/role.constant';
import { Logger } from '../utils/logger.util';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

export class InitDataService {
    private logger = new Logger('InitDataService');

    async initializeDefaultData(): Promise<void> {
        try {
            this.logger.verbose('Starting to initialize default data...');

            // Initialize roles
            await this.initializeRoles();

            // Initialize users
            await this.initializeUsers();

            // Initialize permissions
            await this.initializePermissions();

            // Create default user role if not exists
            await this.createDefaultUserRole();

            this.logger.verbose('Default data initialization completed successfully');
        } catch (error) {
            this.logger.error('Error initializing default data:', error);
            throw error;
        }
    }

    private async initializeRoles(): Promise<void> {
        try {
            const roleService = new RoleController();
            await roleService.initPackageEntity();
            this.logger.verbose('Roles initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing roles:', error);
            throw error;
        }
    }

    private async initializeUsers(): Promise<void> {
        try {
            for (const userData of usersDefault) {
                const existingUser = await User.findById(userData._id);
                if (!existingUser) {
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    await User.create({
                        ...userData,
                        password: hashedPassword
                    });
                    this.logger.verbose(`Default user created: ${userData.username}`);
                }
            }
            this.logger.verbose('Users initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing users:', error);
            throw error;
        }
    }

    private async initializePermissions(): Promise<void> {
        try {
            for (const permissionData of permisstionDefault) {
                const existingPermission = await Permission.findById(permissionData._id);
                if (!existingPermission) {
                    await Permission.create(permissionData);
                    this.logger.verbose(`Default permission created for role: ${permissionData.role}`);
                }
            }
            this.logger.verbose('Permissions initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing permissions:', error);
            throw error;
        }
    }

    private async createDefaultUserRole(): Promise<void> {
        try {
            const userRole = await Role.findOne({ _id: new Types.ObjectId('65a0a995aa7ea10ac4d16962') });
            if (!userRole) {
                await Role.create({
                    name: 'user',
                    _id: '65a0a995aa7ea10ac4d16962'
                });
                this.logger.verbose('Default user role created');
            }
        } catch (error) {
            this.logger.error('Error creating default user role:', error);
            throw error;
        }
    }
}
