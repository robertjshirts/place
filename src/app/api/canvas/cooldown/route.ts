import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Import shared cooldown state
import { userLastPlaced, COOLDOWN_TIME } from '@/lib/db';

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const now = Date.now();
  const lastPlaced = userLastPlaced.get(user.username!);
  
  if (!lastPlaced || now - lastPlaced >= COOLDOWN_TIME) {
    return NextResponse.json({ ready: true });
  }
  
  const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastPlaced)) / 1000);
  return NextResponse.json(
    { ready: false, remainingTime },
    { status: 200 }
  );
}
