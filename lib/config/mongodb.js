import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Database connection helper
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    // Database name is already specified in the MongoDB URI (blogs)
    // So we can use client.db() without parameters to use the default database
    const db = client.db();
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    const { client, db } = await connectToDatabase();
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ MongoDB connection successful');
    console.log(`Connected to database: ${db.databaseName}`);
    
    return { 
      success: true, 
      message: 'Connected to MongoDB',
      database: db.databaseName 
    };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return { success: false, error: error.message };
  }
}