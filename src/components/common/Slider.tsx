/**
 * EcoMind AI Ultra — Accessible Slider Component
 * Custom range input with visual feedback.
 * Accessibility: Keyboard support, ARIA labels, high contrast.
 */

import { useCallback } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={`slider-${label}`} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span className="text-sm font-bold text-emerald-400" aria-live="polite">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          id={`slider-${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={`${label}: ${value}${unit}`}
        />
        <div
          className="absolute top-0 left-0 h-2 bg-emerald-500 rounded-lg pointer-events-none transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
