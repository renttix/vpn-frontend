import mongoose from 'mongoose';

// Define the cached mongoose connection type
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  lastError: Error | null;
  lastErrorTime: number | null;
}

// Add mongoose to the global namespace
declare global {
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';
const isDevelopment = process.env.NODE_ENV === 'development';

if (!MONGODB_URI && !isDevelopment) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize cached connection
let cached: CachedConnection = global.mongoose || { 
  conn: null, 
  promise: null, 
  isConnecting: false,
  lastError: null,
  lastErrorTime: null
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we're in development mode and there's no MongoDB URI, return a mock connection
  if (isDevelopment && (!MONGODB_URI || cached.lastError)) {
    console.warn('MongoDB connection not available. Using mock data in development mode.');
    // Return the mongoose instance without actually connecting
    return mongoose;
  }

  // If we're already trying to connect, wait for that promise
  if (cached.isConnecting && cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      // If the connection fails, we'll try again below
      console.error('Error connecting to MongoDB:', error);
    }
  }

  // If we had an error recently (within the last minute), don't try again immediately
  const errorCooldown = 60000; // 1 minute
  if (cached.lastErrorTime && Date.now() - cached.lastErrorTime < errorCooldown) {
    console.warn('Recent MongoDB connection error. Using fallback data.');
    if (isDevelopment) {
      return mongoose;
    } else {
      throw cached.lastError || new Error('Recent MongoDB connection failure');
    }
  }

  // Start a new connection attempt
  cached.isConnecting = true;
  
  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
    cached.conn = await cached.promise;
    cached.isConnecting = false;
    cached.lastError = null;
    cached.lastErrorTime = null;
    
    console.log('Successfully connected to MongoDB');
    return cached.conn;
  } catch (error) {
    cached.isConnecting = false;
    cached.promise = null;
    cached.lastError = error as Error;
    cached.lastErrorTime = Date.now();
    
    console.error('Failed to connect to MongoDB:', error);
    
    if (isDevelopment) {
      console.warn('Using mock data in development mode due to connection error');
      return mongoose;
    }
    
    throw error;
  }
}

export default connectToDatabase;
