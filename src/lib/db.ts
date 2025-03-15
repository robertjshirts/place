import "server-only";

import { MongoClient, Db, Collection } from 'mongodb';
import { CanvasState, User } from '@/lib/types'

// Exported collections and functions
export let canvasCollection: Collection<CanvasState>;
export let usersCollection: Collection<User>;

// Database connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGO_URL environment variable is not defined");
}

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
});
let db: Db;

/**
 * Connects to MongoDB and initializes collections
 */
async function connect(): Promise<void> {
  try {
    await client.connect();
    db = client.db('place');
    
    // Test the connection
    await db.command({ ping: 1 });
    
    // Initialize collections
    canvasCollection = db.collection<CanvasState>('canvas');
    usersCollection = db.collection<User>('users');
    
    // Ensure collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    
    if (!collectionNames.includes('canvas')) {
      await db.createCollection('canvas');
    }
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
    }
    
    console.log('Connected to MongoDB and ensured collections exist');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw new Error('Failed to connect to database. Please check your network connection and database status.');
  }
}

/**
 * Ensures database connection is established
 */
export async function ensureConnection(): Promise<void> {
  if (!db) {
    await connect();
  }
}
