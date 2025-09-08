import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { UpdateUserDto } from '../dto/users/update-user.dto';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { validateQuery } from '../middleware/validate-query.middleware';
import { UserQueryDto } from '../dto/users/user-query.dto';
import { ActionEnum, SubjectEnum } from '../models/permission.model';

const router = Router();
const userController = new UserController();

// Public routes
router.get('/profile', authenticateToken, (req, res) => userController.getProfile(req, res));

// Protected routes with authorization
router.get('/',
    authorization(SubjectEnum.USER, ActionEnum.READ),
    validateQuery(UserQueryDto),
    (req, res) => userController.getAllUsers(req, res)
);

router.get('/:id',
    authorization(SubjectEnum.USER, ActionEnum.READ),
    (req, res) => userController.getUserById(req, res)
);

router.post('/',
    authorization(SubjectEnum.USER, ActionEnum.CREATE),
    validateDto(CreateUserDto),
    (req, res) => userController.createUser(req, res)
);

router.put('/:id',
    authorization(SubjectEnum.USER, ActionEnum.UPDATE),
    validateDto(UpdateUserDto),
    (req, res) => userController.updateUser(req, res)
);

router.delete('/:id',
    authorization(SubjectEnum.USER, ActionEnum.DELETE),
    (req, res) => userController.deleteUser(req, res)
);

export default router;