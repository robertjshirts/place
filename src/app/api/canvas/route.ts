import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCanvasState, getUserLastPlaced, COOLDOWN_TIME, CANVAS_SIZE, saveUserLastPlaced, saveCanvasState } from '@/lib/db';

export async function GET() {
  const canvasState = await getCanvasState();
  return NextResponse.json(canvasState);
}

export async function POST(request: NextRequest) {
  try {
    const { x, y, color } = await request.json();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401},
      )
    }
    
    // Validate input
    if (
      typeof x !== 'number' || 
      typeof y !== 'number' || 
      typeof color !== 'string' || 
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
    const lastPlaced = await getUserLastPlaced(user.username!);
    
    if (lastPlaced && now - lastPlaced < COOLDOWN_TIME) {
      const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastPlaced)) / 1000);
      return NextResponse.json(
        { error: `You need to wait ${remainingTime} seconds before placing another pixel` },
        { status: 429 }
      );
    }
    
    // Update pixel and user's last placed time
    const canvasState = await getCanvasState();
    canvasState.pixels[y][x] = {
      color,
      lastUpdated: now,
      lastUpdatedBy: user.username!,
    };
    saveUserLastPlaced(user.username!, now);
    saveCanvasState(canvasState);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating canvas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
