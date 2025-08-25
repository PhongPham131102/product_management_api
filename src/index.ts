import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Logger } from './utils/logger.util';
import { connectToDatabase } from './config/database.config';
import { errorHandler } from './middleware/error.middleware';
const logger = new Logger("Application");
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(errorHandler);


async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
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