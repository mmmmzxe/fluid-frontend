import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
}

const predefinedColors = [
  // Basic Colors
  { name: 'Red', value: '#ef4444', hex: '#ef4444' },
  { name: 'Blue', value: '#3b82f6', hex: '#3b82f6' },
  { name: 'Green', value: '#22c55e', hex: '#22c55e' },
  { name: 'Yellow', value: '#eab308', hex: '#eab308' },
  { name: 'Purple', value: '#a855f7', hex: '#a855f7' },
  { name: 'Pink', value: '#ec4899', hex: '#ec4899' },
  { name: 'Orange', value: '#f97316', hex: '#f97316' },
  { name: 'Black', value: '#000000', hex: '#000000' },
  { name: 'White', value: '#ffffff', hex: '#ffffff' },
  { name: 'Gray', value: '#6b7280', hex: '#6b7280' },
  
  // Extended Red Palette
  { name: 'Crimson', value: '#dc143c', hex: '#dc143c' },
  { name: 'Dark Red', value: '#8b0000', hex: '#8b0000' },
  { name: 'Fire Brick', value: '#b22222', hex: '#b22222' },
  { name: 'Indian Red', value: '#cd5c5c', hex: '#cd5c5c' },
  { name: 'Light Coral', value: '#f08080', hex: '#f08080' },
  { name: 'Salmon', value: '#fa8072', hex: '#fa8072' },
  { name: 'Tomato', value: '#ff6347', hex: '#ff6347' },
  { name: 'Coral', value: '#ff7f50', hex: '#ff7f50' },
  
  // Extended Blue Palette
  { name: 'Navy', value: '#1e3a8a', hex: '#1e3a8a' },
  { name: 'Dark Blue', value: '#00008b', hex: '#00008b' },
  { name: 'Royal Blue', value: '#4169e1', hex: '#4169e1' },
  { name: 'Steel Blue', value: '#4682b4', hex: '#4682b4' },
  { name: 'Sky Blue', value: '#87ceeb', hex: '#87ceeb' },
  { name: 'Light Blue', value: '#add8e6', hex: '#add8e6' },
  { name: 'Powder Blue', value: '#b0e0e6', hex: '#b0e0e6' },
  { name: 'Cornflower', value: '#6495ed', hex: '#6495ed' },
  
  // Extended Green Palette
  { name: 'Dark Green', value: '#006400', hex: '#006400' },
  { name: 'Forest Green', value: '#228b22', hex: '#228b22' },
  { name: 'Lime Green', value: '#32cd32', hex: '#32cd32' },
  { name: 'Sea Green', value: '#2e8b57', hex: '#2e8b57' },
  { name: 'Teal', value: '#008080', hex: '#008080' },
  { name: 'Aqua', value: '#00ffff', hex: '#00ffff' },
  { name: 'Turquoise', value: '#40e0d0', hex: '#40e0d0' },
  { name: 'Mint', value: '#98fb98', hex: '#98fb98' },
  
  // Extended Yellow/Orange Palette
  { name: 'Gold', value: '#ffd700', hex: '#ffd700' },
  { name: 'Dark Orange', value: '#ff8c00', hex: '#ff8c00' },
  { name: 'Peru', value: '#cd853f', hex: '#cd853f' },
  { name: 'Sandy Brown', value: '#f4a460', hex: '#f4a460' },
  { name: 'Peach', value: '#ffcba4', hex: '#ffcba4' },
  { name: 'Moccasin', value: '#ffe4b5', hex: '#ffe4b5' },
  { name: 'Wheat', value: '#f5deb3', hex: '#f5deb3' },
  { name: 'Bisque', value: '#ffe4c4', hex: '#ffe4c4' },
  
  // Extended Purple/Violet Palette
  { name: 'Dark Violet', value: '#9400d3', hex: '#9400d3' },
  { name: 'Blue Violet', value: '#8a2be2', hex: '#8a2be2' },
  { name: 'Medium Purple', value: '#9370db', hex: '#9370db' },
  { name: 'Plum', value: '#dda0dd', hex: '#dda0dd' },
  { name: 'Thistle', value: '#d8bfd8', hex: '#d8bfd8' },
  { name: 'Lavender', value: '#e6e6fa', hex: '#e6e6fa' },
  { name: 'Orchid', value: '#da70d6', hex: '#da70d6' },
  { name: 'Magenta', value: '#ff00ff', hex: '#ff00ff' },
  
  // Extended Pink Palette
  { name: 'Deep Pink', value: '#ff1493', hex: '#ff1493' },
  { name: 'Hot Pink', value: '#ff69b4', hex: '#ff69b4' },
  { name: 'Light Pink', value: '#ffb6c1', hex: '#ffb6c1' },
  { name: 'Pale Violet Red', value: '#db7093', hex: '#db7093' },
  { name: 'Medium Violet Red', value: '#c71585', hex: '#c71585' },
  { name: 'Misty Rose', value: '#ffe4e1', hex: '#ffe4e1' },
  { name: 'Lavender Blush', value: '#fff0f5', hex: '#fff0f5' },
  { name: 'Pink', value: '#ffc0cb', hex: '#ffc0cb' },
  
  // Brown/Tan Palette
  { name: 'Brown', value: '#8b4513', hex: '#8b4513' },
  { name: 'Dark Brown', value: '#654321', hex: '#654321' },
  { name: 'Saddle Brown', value: '#8b4513', hex: '#8b4513' },
  { name: 'Sienna', value: '#a0522d', hex: '#a0522d' },
  { name: 'Chocolate', value: '#d2691e', hex: '#d2691e' },
  { name: 'Tan', value: '#d2b48c', hex: '#d2b48c' },
  { name: 'Burlywood', value: '#deb887', hex: '#deb887' },
  { name: 'Navajo White', value: '#ffdead', hex: '#ffdead' },
  
  // Gray Palette
  { name: 'Dark Gray', value: '#a9a9a9', hex: '#a9a9a9' },
  { name: 'Light Gray', value: '#d3d3d3', hex: '#d3d3d3' },
  { name: 'Dim Gray', value: '#696969', hex: '#696969' },
  { name: 'Silver', value: '#c0c0c0', hex: '#c0c0c0' },
  { name: 'Gainsboro', value: '#dcdcdc', hex: '#dcdcdc' },
  { name: 'White Smoke', value: '#f5f5f5', hex: '#f5f5f5' },
  { name: 'Slate Gray', value: '#708090', hex: '#708090' },
  { name: 'Light Slate Gray', value: '#778899', hex: '#778899' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select a color" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('');

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorSubmit = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      onChange(customColor);
      setCustomColor('');
      setIsOpen(false);
    }
  };

  const selectedColor = predefinedColors.find(color => color.hex === value);

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Choose a color</h4>
            
            {/* Predefined Colors Grid */}
            <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
              {predefinedColors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  className="relative w-8 h-8 rounded-md border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorSelect(color.hex)}
                  title={color.name}
                >
                  {value === color.hex && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Color (Hex)</label>
              <div className="flex gap-2">
                <Input
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCustomColorSubmit}
                  disabled={!customColor || !/^#[0-9A-F]{6}$/i.test(customColor)}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Color Preview */}
            {value && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: value }}
                />
                <span className="text-sm font-mono">{value}</span>
                {selectedColor && (
                  <span className="text-sm text-gray-600">({selectedColor.name})</span>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
