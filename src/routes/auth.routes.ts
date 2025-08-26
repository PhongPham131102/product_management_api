import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { LoginDto } from '../dto/auth/login.dto';

const router = Router();
const authController = new AuthController();

// Auth routes
router.post('/register', validateDto(CreateUserDto), authController.register);
router.post('/login', validateDto(LoginDto), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

export default router;
