import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Logger } from './utils/logger.util';
import { connectToDatabase } from './config/database.config';
import { InitDataService } from './services/init-data.service';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';

const logger = new Logger("Application");
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToDatabase();

    // Initialize default data
    const initDataService = new InitDataService();
    await initDataService.initializeDefaultData();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.debug(`Server is running on port ${PORT}`);
      logger.warn(`Server is running on port ${PORT}`);
      logger.error(`Server is running on port ${PORT}`);
      logger.log(`Server is running on port ${PORT}`);
      logger.verbose(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app; 