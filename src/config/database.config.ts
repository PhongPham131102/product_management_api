import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Logger } from '../utils/logger.util';

dotenv.config();

const logger = new Logger('DatabaseConfig');

export const databaseConfig = {
  mongoUri: process.env['MONGO_URI'] || 'mongodb://localhost:27017/product_management',
  options: {
    maxPoolSize: 10, 
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, 
    bufferMaxEntries: 0 
  }
};

export const connectToDatabase = async (): Promise<void> => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(databaseConfig.mongoUri, databaseConfig.options);
    logger.info('Successfully connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}; 