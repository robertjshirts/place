'use client';

import { useState } from 'react';

// Predefined color palette
const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#FF0080', // Pink
  '#0080FF', // Light Blue
  '#808080', // Gray
  '#804000', // Brown
  '#408000', // Dark Green
  '#800040', // Burgundy
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  const [showCustom, setShowCustom] = useState(false);

  const handleColorClick = (color: string) => {
    onColorChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Color:</span>
        <div 
          className="w-6 h-6 border border-gray-300 dark:border-gray-700"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
      
      <div className="grid grid-cols-8 gap-1">
        {COLORS.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-sm cursor-pointer hover:scale-110 transition-transform ${
              selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border border-gray-300 dark:border-gray-700'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      
      <button
        className="text-xs underline mt-1"
        onClick={() => setShowCustom(!showCustom)}
      >
        {showCustom ? 'Hide custom color' : 'Custom color'}
      </button>
      
      {showCustom && (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-8 h-8"
          />
          <span className="text-xs">{customColor}</span>
        </div>
      )}
    </div>
  );
}
