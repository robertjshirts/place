import { create } from 'zustand';
import { Pixel, CanvasState } from '@/lib/types'

type Store = {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;

  canvasState: CanvasState | null;
  setCanvasState: (state: CanvasState | null) => void;
  
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  
  cooldownEnd: number | null;
  setCooldownEnd: (time: number | null) => void;
  
  updateClientPixel: (x: number, y: number, color: string, username: string) => void;
};

export const useStore = create<Store>((set) => ({
  loading: true,
  setLoading: (isLoading) => set({ loading: isLoading }),

  canvasState: null,
  setCanvasState: (state) => set({ canvasState: state }),
  
  selectedColor: '#000000',
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  cooldownEnd: null,
  setCooldownEnd: (time) => set({ cooldownEnd: time }),
  
  updateClientPixel: (x, y, color, username) => set((state) => {
    if (!state.canvasState) return state;
    
    // Create deep copy of the canvas state
    const newPixels = [...state.canvasState.pixels.map((row: Pixel[]) => [...row])];
    
    // Update the specific pixel
    newPixels[y][x] = {
      color,
      lastUpdated: Date.now(),
      lastUpdatedBy: username,
    };
    
    return {
      ...state,
      canvasState: {
        ...state.canvasState,
        pixels: newPixels,
      },
    };
  }),
}));
