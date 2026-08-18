import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import Color from 'color'; // Ensure the package is used as requested

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

const PREDEFINED_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#0f172a', '#ffffff'];

export function ColorPicker({ color, onChange, strokeWidth, onStrokeWidthChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
      {/* Color Swatches */}
      <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
        {PREDEFINED_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : 'none' }}
          />
        ))}
        {/* Custom Color Input */}
        <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 transition-transform">
          <input 
            type="color" 
            value={color} 
            onChange={e => onChange(e.target.value)} 
            className="absolute -inset-2 w-10 h-10 cursor-pointer"
          />
        </div>
      </div>
      
      {/* Stroke Width Slider */}
      <div className="flex items-center gap-3 min-w-[120px]">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8">{strokeWidth}px</span>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[strokeWidth]}
          onValueChange={(val) => onStrokeWidthChange(val[0])}
          max={50}
          min={2}
          step={1}
        >
          <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-indigo-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-indigo-500 shadow-sm rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </Slider.Root>
      </div>
    </div>
  );
}