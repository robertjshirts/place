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
export const CANVAS_SIZE = 50;
const DEFAULT_COLOR = '#FFFFFF';

// In-memory canvas state (in a real app, this would be in a database)
export const canvasState: CanvasState = {
  pixels: Array(CANVAS_SIZE).fill(null).map(() => 
    Array(CANVAS_SIZE).fill(null).map(() => ({
      color: DEFAULT_COLOR,
      lastUpdated: Date.now(),
      lastUpdatedBy: '',
    }))
  ),
  size: CANVAS_SIZE,
};

// Track last pixel placement times per user
export const userLastPlaced = new Map<string, number>();

// Cooldown time in milliseconds (1 minute)
export const COOLDOWN_TIME = 60 * 1000;
