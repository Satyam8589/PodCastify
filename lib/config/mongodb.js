// lib/config/mongodb.js
import { MongoClient } from 'mongodb';

// Don't throw error at module level - only when actually connecting
const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

// Function to get client promise (lazy initialization)
function getClientPromise() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (!clientPromise) {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  return clientPromise;
}

export async function connectToDatabase() {
  try {
    const client = await getClientPromise();
    const db = client.db('blogs'); // Explicitly specify database name
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export the promise getter instead of the promise itself
export default getClientPromise;