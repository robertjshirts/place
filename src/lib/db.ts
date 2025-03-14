import { MongoClient, Db, Collection } from 'mongodb';

// Constants
export const CANVAS_SIZE = 50;
export const DEFAULT_COLOR = '#FFFFFF';
export const COOLDOWN_TIME = 60 * 1000; // 1 minute in milliseconds

// Type definitions
export type Pixel = {
  color: string;
  lastUpdated: number;
  lastUpdatedBy: string;
};

export type CanvasState = {
  id: string;
  pixels: Pixel[][];
  size: number;
};

export type User = {
  id: string;
  lastPlaced: number;
};

// Database connection
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("MONGO_URL environment variable is not defined");
}

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
});
let db: Db;
let canvasCollection: Collection<CanvasState>;
let usersCollection: Collection<User>;

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
async function ensureConnection(): Promise<void> {
  if (!db) {
    await connect();
  }
}

/**
 * Saves the current canvas state to the database
 */
export async function saveCanvasState(state: CanvasState): Promise<void> {
  await ensureConnection();
  await canvasCollection.updateOne(
    { id: 'current' },
    { $set: { ...state, id: 'current' } },
    { upsert: true }
  );
}

/**
 * Records when a user last placed a pixel
 */
export async function saveUserLastPlaced(
  username: string,
  timestamp: number
): Promise<void> {
  await ensureConnection();
  await usersCollection.updateOne(
    { id: username },
    { $set: { id: username, lastPlaced: timestamp } },
    { upsert: true }
  );
}

/**
 * Creates a new blank canvas state
 */
function createNewCanvasState(): CanvasState {
  return {
    id: 'current',
    pixels: Array(CANVAS_SIZE)
      .fill(null)
      .map(() =>
        Array(CANVAS_SIZE)
          .fill(null)
          .map(() => ({
            color: DEFAULT_COLOR,
            lastUpdated: Date.now(),
            lastUpdatedBy: '',
          }))
      ),
    size: CANVAS_SIZE,
  };
}

/**
 * Retrieves the current canvas state or creates a new one if none exists
 */
export async function getCanvasState(): Promise<CanvasState> {
  await ensureConnection();
  const state = await canvasCollection.findOne({ id: 'current' });

  if (!state) {
    // Initialize new canvas state
    const newState = createNewCanvasState();
    await saveCanvasState(newState);
    return newState;
  }
  
  return state;
}

/**
 * Gets the timestamp of when a user last placed a pixel
 */
export async function getUserLastPlaced(username: string): Promise<number> {
  await ensureConnection();
  const user = await usersCollection.findOne({ id: username });
  return user?.lastPlaced ?? 0;
}
