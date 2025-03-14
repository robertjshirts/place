import { NextRequest, NextResponse } from 'next/server';

// Define types
type Pixel = {
  color: string;
  lastUpdated: number;
  lastUpdatedBy: string;
};

type CanvasState = {
  pixels: Pixel[][];
  size: number;
};

// Initialize canvas with white pixels
const CANVAS_SIZE = 50;
const DEFAULT_COLOR = '#FFFFFF';

// In-memory canvas state (in a real app, this would be in a database)
const canvasState: CanvasState = {
  pixels: Array(CANVAS_SIZE).fill(null).map(() => 
    Array(CANVAS_SIZE).fill(null).map(() => ({
      color: DEFAULT_COLOR,
      lastUpdated: Date.now(),
      lastUpdatedBy: '',
    }))
  ),
  size: CANVAS_SIZE,
};

// Cooldown time in milliseconds (1 minute)
const COOLDOWN_TIME = 60 * 1000;

export async function GET() {
  return NextResponse.json(canvasState);
}

export async function POST(request: NextRequest) {
  try {
    const { x, y, color, userId } = await request.json();
    
    // Validate input
    if (
      typeof x !== 'number' || 
      typeof y !== 'number' || 
      typeof color !== 'string' || 
      typeof userId !== 'string' ||
      x < 0 || 
      x >= CANVAS_SIZE || 
      y < 0 || 
      y >= CANVAS_SIZE
    ) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    
    // Check if user is on cooldown
    const now = Date.now();
    const userLastUpdates = canvasState.pixels.flatMap((row, rowIndex) => 
      row.map((pixel, colIndex) => ({
        x: colIndex,
        y: rowIndex,
        lastUpdated: pixel.lastUpdated,
        lastUpdatedBy: pixel.lastUpdatedBy,
      }))
    ).filter(pixel => pixel.lastUpdatedBy === userId);
    
    const lastUpdate = userLastUpdates.sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
    
    if (lastUpdate && now - lastUpdate.lastUpdated < COOLDOWN_TIME) {
      const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastUpdate.lastUpdated)) / 1000);
      return NextResponse.json(
        { error: `You need to wait ${remainingTime} seconds before placing another pixel` },
        { status: 429 }
      );
    }
    
    // Update pixel
    canvasState.pixels[y][x] = {
      color,
      lastUpdated: now,
      lastUpdatedBy: userId,
    };
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating canvas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
