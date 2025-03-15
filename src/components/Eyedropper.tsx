'use client';

import { useState, useEffect } from 'react';

interface EyeDropperProps {
  onColorSelected: (color: string) => void;
}

export function EyeDropper({ onColorSelected }: EyeDropperProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPickerActive, setIsPickerActive] = useState(false);

  useEffect(() => {
    // Check if the EyeDropper API is supported in the browser
    setIsSupported('EyeDropper' in window);
  }, []);

  const handleEyeDropper = async () => {
    if (!isSupported) return;
    
    try {
      setIsPickerActive(true);
      
      // @ts-expect-error - TypeScript doesn't have types for the EyeDropper API yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onColorSelected(result.sRGBHex);
    } catch (error) {
      console.error('EyeDropper error:', error);
    } finally {
      setIsPickerActive(false);
    }
  };

  if (!isSupported) {
    return null; // Don't render anything if not supported
  }

  return (
    <button
      onClick={handleEyeDropper}
      disabled={isPickerActive}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      title="Pick color from screen"
      aria-label="Pick color from screen with eyedropper tool"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPickerActive ? "animate-pulse text-blue-500" : ""}
      >
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.5-3.5a2.12 2.12 0 0 1 3 0 2.12 2.12 0 0 1 0 3L18 9l-3 3" />
        <path d="M15 9 9 15" />
      </svg>
    </button>
  );
}
