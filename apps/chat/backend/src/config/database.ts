/**
 * MongoDB Database Configuration
 *
 * Handles MongoDB connection for audit logs and persistent storage
 */

import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/darevel_chat';

let isConnected = false;

/**
 * Connect to MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(MONGO_URL, {
      // Modern mongoose doesn't need these options, but keeping for backwards compatibility
      // useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('Server will continue without MongoDB. Audit logs will not be persisted.');
    isConnected = false;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error: any) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Check if MongoDB is connected
 */
export const isDatabaseConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = (): {
  connected: boolean;
  readyState: number;
  host?: string;
  name?: string;
} => {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};
