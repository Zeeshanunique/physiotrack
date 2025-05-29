import mongoose from 'mongoose';
import app from './app.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

const PORT = process.env.PORT || 3001;

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('⚠️  No MongoDB URI found. Server will run without database connection.');
      return false;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    console.warn('⚠️  Server will continue without database connection.');
    console.warn('⚠️  Please check your MongoDB credentials and try again.');
    return false;
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);
