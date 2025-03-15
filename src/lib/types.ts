// Constants
export const CANVAS_SIZE = 50;
export const DEFAULT_COLOR = '#FFFFFF';
export const COOLDOWN_INTERVAL = 15 * 1000; // 15s cooldown on all ops

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
  id: string; // Username
  pixelCooldownEnd: number;
};