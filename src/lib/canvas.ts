"use server";

import { canvasCollection, ensureConnection } from '@/lib/db';
import { CanvasState, CANVAS_SIZE, DEFAULT_COLOR } from '@/lib/types';
import { currentUser } from '@clerk/nextjs/server';
import { getPixelCooldownEnd, resetPixelCooldown } from './cooldown';

// TODO: add cache and sync to mongo every 5s or something

/**
 * Saves the current canvas state to the database
 */
export async function saveCanvasState(state: CanvasState) {
  await ensureConnection();
  await canvasCollection.updateOne(
    { id: 'current' },
    { $set: { ...state, id: 'current' } },
    { upsert: true }
  );
  return;
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
  
  // Convert MongoDB document to plain JavaScript object
  // This removes MongoDB-specific properties like _id with buffer
  return {
    id: state.id,
    pixels: state.pixels,
    size: state.size
  };
}

/**
 * Place a pixel, returns the cooldownEnd
 */
export async function placePixel(x: number, y: number, selectedColor: string) {
  console.log("Placing pixel")
  const user = await currentUser();
  if (!user) return null;
  console.log("Username: ", user.username);
  if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) {
    return null;
  }

  const username = user.username!;

  // Calculate cooldown stuff
  const cooldownEnd = await getPixelCooldownEnd(username);
  const now = Date.now()
  console.log("Current time: ", now, "\n End cooldown: ", cooldownEnd);
  console.log(now < cooldownEnd)
  if (now < cooldownEnd) {
    console.log("Pixel on cooldown")
    return cooldownEnd;
  }

  // Update canvas
  const canvasState = await getCanvasState();
  canvasState.pixels[y][x] = {
    color: selectedColor,
    lastUpdated: now,
    lastUpdatedBy: username
  }
  await saveCanvasState(canvasState);

  // Get new cooldown and reset it in the db
  const updatedCooldownEnd = await resetPixelCooldown(username);
  console.log("Updated cooldown end: ", updatedCooldownEnd)
  return updatedCooldownEnd;
}
