'use client';
import { useEffect, useState, useRef } from 'react';
import ColorPicker from './ColorPicker';
import CooldownTimer from './CooldownTimer';
import { useUser } from '@clerk/nextjs'

type Pixel = {
  color: string;
  lastUpdated: number;
  lastUpdatedBy: string;
};

type CanvasState = {
  pixels: Pixel[][];
  size: number;
};

export default function Canvas() {
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user } = useUser();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pixelSize = 10; // Size of each pixel in pixels

  // Define fetchCanvasState function before it's used in useEffect
  const fetchCanvasState = async () => {
    try {
      const response = await fetch('/api/canvas');
      if (!response.ok) {
        throw new Error('Failed to fetch canvas state');
      }
      const data = await response.json();
      setCanvasState(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching canvas state:', error);
      setError('Failed to load canvas. Please try again later.');
      setLoading(false);
    }
  };

  // Initialize user ID and fetch canvas state
  useEffect(() => {
    fetchCanvasState();

    // Refresh canvas state every 5 seconds
    const intervalId = setInterval(fetchCanvasState, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handlePixelClick = async (x: number, y: number) => {
    if (!isSignedIn || !user || !canvasState) {
      setError('You must be signed in to place a pixel');
      return;
    }
    
    // Check if user is on cooldown
    if (cooldownEnd && Date.now() < cooldownEnd) {
      return;
    }

    try {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          color: selectedColor,
          username: user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Parse the remaining time from the error message
          const match = data.error.match(/wait (\d+) seconds/);
          if (match && match[1]) {
            const seconds = parseInt(match[1], 10);
            setCooldownEnd(Date.now() + seconds * 1000);
          } else {
            setCooldownEnd(Date.now() + 60 * 1000); // Default to 60 seconds
          }
          return;
        }
        setError(data.error || 'Failed to update pixel');
        return;
      }

      // Update local canvas state
      const newCanvasState = { ...canvasState };
      newCanvasState.pixels[y][x] = {
        color: selectedColor,
        lastUpdated: Date.now(),
        lastUpdatedBy: user.username || 'Anonymous',
      };
      setCanvasState(newCanvasState);
      
      // Set cooldown
      setCooldownEnd(Date.now() + 60 * 1000);
      setError(null);
    } catch (error) {
      console.error('Error updating pixel:', error);
      setError('Failed to update pixel. Please try again later.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading canvas...</div>;
  }

  if (error && !canvasState) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!canvasState) {
    return <div className="text-center">No canvas data available</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold mb-1">r/place Clone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click on a pixel to change its color. You can place one pixel per minute.
        </p>
        {user?.username && (
          <p className="text-xs text-gray-500 mt-1">Signed in as: {user.username}</p>
        )}
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

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
                title={`(${x + 1}, ${y + 1})`}
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
