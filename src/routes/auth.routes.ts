import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreateUserDto } from '../dto/users/create-user.dto';
import { LoginDto } from '../dto/auth/login.dto';

const router = Router();
const authController = new AuthController();

// Auth routes
router.post('/register', validateDto(CreateUserDto), (req, res) => authController.register(req, res));
router.post('/login', validateDto(LoginDto), (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

export default router;
