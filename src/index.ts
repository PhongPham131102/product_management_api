import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Logger } from './utils/logger.util';
import { loggerStream } from './utils/logger.util';
import { connectToDatabase } from './config/database.config';
import { InitDataService } from './services/init-data.service';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import stockRoutes from './routes/stock.routes';

const logger = new Logger("Application");
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: loggerStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/stocks', stockRoutes);

app.use(errorMiddleware);

async function startServer() {
  try {
    await connectToDatabase();

    // Initialize default data
    const initDataService = new InitDataService();
    await initDataService.initializeDefaultData();

    app.listen(PORT, () => {
      logger.verbose(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.verbose('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.verbose('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app; 