import { CanvasState, canvasCollection, ensureConnection, CANVAS_SIZE, DEFAULT_COLOR } from './db';

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
 * Creates a new blank canvas state
 */
export function createNewCanvasState(): CanvasState {
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
