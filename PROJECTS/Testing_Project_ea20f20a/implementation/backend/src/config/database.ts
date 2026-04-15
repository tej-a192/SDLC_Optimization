import mongoose from 'mongoose';
import { env } from './environment';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = 'mongodb://localhost:27017/todo_app';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};