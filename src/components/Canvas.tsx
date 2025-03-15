'use client';
import { useEffect, useCallback, useRef, useState } from 'react';
import ColorPicker from './ColorPicker';
import CooldownTimer from './CooldownTimer';
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { getPixelCooldownEnd } from '@/lib/cooldown';
import { getCanvasState, placePixel } from '@/lib/canvas';
import { COOLDOWN_INTERVAL } from '@/lib/types';


export default function Canvas() {
  const { canvasState, setCanvasState, selectedColor, setSelectedColor, cooldownEnd, setCooldownEnd, updateClientPixel } = useStore();
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pixelSize = 10; // Size of each pixel in pixels


  // Fetch the canvasState on page load
  const fetchCanvasState = useCallback(async () => {
    try {
      setCanvasState(await getCanvasState());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching canvas state:', error);
      toast.error('Error fetching canvas. Try reloading.')
      setLoading(false);
    }
  }, [setCanvasState]);

  // Refetch every 5s
  useEffect(() => {
    fetchCanvasState();

    // Refresh canvas state every 5 seconds
    const intervalId = setInterval(fetchCanvasState, 5000);
    return () => clearInterval(intervalId);
  }, [fetchCanvasState]);

  // Get initial pixel cooldown
  useEffect(() => {
    if (!user) return;
    getPixelCooldownEnd(user.username!)
      .then((storedCooldownEnd) => {
        if (!storedCooldownEnd) return;
        if (Date.now() >= storedCooldownEnd) {
          setCooldownEnd(storedCooldownEnd);
        }
      })
  }, [user, setCooldownEnd])

  // Handle pixel click
  const handlePixelClick = async (x: number, y: number) => {
    if (!user || !canvasState) {
      toast.error('You must be signed in to place a pixel');
      return;
    }
    
    // Check if user is on cooldown
    if (!cooldownEnd) {
      setCooldownEnd(await getPixelCooldownEnd(user.username!));
    }

    if (Date.now() < cooldownEnd!) {
      const remaining = Math.ceil((cooldownEnd! - Date.now()) / 1000);
      toast.error(`Please wait ${remaining} seconds before placing another pixel`);
      return;
    }

    // Try to place a pixel
    const postPixelCooldownEnd = await placePixel(x, y, selectedColor);
    if (!postPixelCooldownEnd) {
      toast.error("Something weird happened. Reload the page.");
      return;
    }

    updateClientPixel(x, y, selectedColor, user.username!);
    setCooldownEnd(postPixelCooldownEnd);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading canvas...</div>;
  }

  if (!canvasState) {
    return <div className="text-red-500 text-center">There seems to have been an error. Try reloading.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-2 pt-8">
        <h2 className="text-xl font-bold mb-1">r/place Clone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click on a pixel to change its color. You can place one pixel every 10 seconds.
        </p>
        {user?.username && (
          <p className="text-xs text-gray-500 mt-1">Signed in as: {user.username}</p>
        )}
      </div>

      <div className="relative">
        <div 
          ref={canvasRef}
          className="grid border border-gray-300 dark:border-gray-700"
          style={{
            gridTemplateColumns: `repeat(${canvasState.size}, ${pixelSize}px)`,
            width: `${canvasState.size * pixelSize}px`,
            height: `${canvasState.size * pixelSize}px`,
          }}
        >
          {canvasState.pixels.map((row, y) =>
            row.map((pixel, x) => (
              <div
                key={`${x}-${y}`}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: pixel.color,
                  width: `${pixelSize}px`,
                  height: `${pixelSize}px`,
                }}
                onClick={() => handlePixelClick(x, y)}
                title={`(${x + 1}, ${y + 1}) - Placed by: ${pixel.lastUpdatedBy || 'unknown'}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
        <CooldownTimer cooldownEnd={cooldownEnd} />
      </div>
    </div>
  );
}
