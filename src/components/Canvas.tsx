'use client';
import { useRef } from 'react';
import ColorPicker from './ColorPicker';
import CooldownTimer from './CooldownTimer';
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { placePixel } from '@/lib/canvas';
import { useFetchPixelCooldown } from '@/lib/hooks/useFetchPixelCooldown';
import { useFetchCanvas } from '@/lib/hooks/useFetchCanvas';


export default function Canvas() {
  const { 
    loading,
    canvasState, 
    selectedColor, 
    setSelectedColor, 
    cooldownEnd, 
    setCooldownEnd,
    updateClientPixel 
  } = useStore();

  const { user } = useUser();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pixelSize = 10; // Size of each pixel in pixels

  // Fetch initial pixel cooldown
  useFetchPixelCooldown(user?.username);
  useFetchCanvas();

  // Handle pixel click
  const handlePixelClick = async (x: number, y: number) => {
    if (!canvasState) {
      toast.error('There was an error. Try reloading the page');
      return;
    }

    if (!user) {
      toast.error('You must be signed in to place a pixel');
      return;
    }

    if (Date.now() < cooldownEnd!) {
      const remaining = Math.ceil((cooldownEnd! - Date.now()) / 1000);
      toast.error(`Please wait ${remaining} seconds before placing another pixel`);
      return;
    }

    // Show change immediately
    updateClientPixel(x, y, selectedColor, user.username!);

    // Try to place a pixel
    const postPixelCooldownEnd = await placePixel(x, y, selectedColor);
    if (!postPixelCooldownEnd) {
      toast.error("Something weird happened. Reload the page.");
      return;
    }

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
          Click on a pixel to change its color. You can place one pixel every 15 seconds.
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
        <CooldownTimer />
      </div>
    </div>
  );
}
