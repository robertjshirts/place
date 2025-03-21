'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function CooldownTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const cooldownEnd = useStore(state => state.cooldownEnd);

  useEffect(() => {
    if (!cooldownEnd) {
      setTimeRemaining(null);
      return;
    }

    // Calculate initial time remaining
    const initialTimeRemaining = Math.max(0, cooldownEnd - Date.now());
    setTimeRemaining(initialTimeRemaining);

    // Update timer every second
    const intervalId = setInterval(() => {
      const remaining = Math.max(0, cooldownEnd - Date.now());
      setTimeRemaining(remaining);

      // Clear interval when timer reaches 0
      if (remaining <= 0) {
        clearInterval(intervalId);
        setTimeRemaining(null);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownEnd]);

  if (!timeRemaining) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-sm">Ready to place a pixel</span>
      </div>
    );
  }

  // Format time remaining as MM:SS
  const seconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <span className="text-sm">
        Cooldown: <span className="font-mono">{formattedTime}</span>
      </span>
    </div>
  );
}
