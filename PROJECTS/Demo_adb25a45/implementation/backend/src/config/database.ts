import mongoose from 'mongoose';
import { ENV } from './env';

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * 
 * @returns Promise<void>
 */
async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

export { connectToDatabase };