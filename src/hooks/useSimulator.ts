/**
 * EcoMind AI Ultra — Future Carbon Simulator Hook
 * Calculates projected emissions based on lifestyle slider changes.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SimulatorSlider, SimulatorResult } from '../types';

const DEFAULT_SLIDERS: SimulatorSlider[] = [
  { id: 'driveLess', label: 'Drive Less', value: 0, min: 0, max: 100, step: 5, unit: '% reduction', category: 'transport' },
  { id: 'veganMeals', label: 'More Vegan Meals', value: 0, min: 0, max: 100, step: 5, unit: '% of meals', category: 'food' },
  { id: 'reduceShopping', label: 'Reduce Shopping', value: 0, min: 0, max: 100, step: 5, unit: '% reduction', category: 'shopping' },
  { id: 'renewableEnergy', label: 'Renewable Energy', value: 0, min: 0, max: 100, step: 5, unit: '% usage', category: 'energy' },
  { id: 'publicTransit', label: 'Public Transit', value: 0, min: 0, max: 100, step: 5, unit: '% of trips', category: 'transport' },
];

// Baseline monthly emissions (kg CO2e) per category
const BASELINE_EMISSIONS: Record<string, number> = {
  transport: 120,
  food: 80,
  shopping: 60,
  energy: 100,
};

// Cost savings per kg CO2e reduced (approximate)
const COST_SAVINGS_PER_KG: Record<string, number> = {
  transport: 0.15,
  food: 0.08,
  shopping: 0.25,
  energy: 0.12,
};

export function useSimulator() {
  const [sliders, setSliders] = useState<SimulatorSlider[]>(DEFAULT_SLIDERS);

  const updateSlider = useCallback((id: string, value: number) => {
    setSliders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    );
  }, []);

  const result: SimulatorResult = useMemo(() => {
    let totalReduction = 0;
    let totalMoneySaved = 0;

    sliders.forEach((slider) => {
      const baseline = BASELINE_EMISSIONS[slider.category] || 0;
      const reduction = baseline * (slider.value / 100);
      const savings = reduction * (COST_SAVINGS_PER_KG[slider.category] || 0);
      totalReduction += reduction;
      totalMoneySaved += savings;
    });

    const baselineTotal = Object.values(BASELINE_EMISSIONS).reduce((a, b) => a + b, 0);
    const newEmissions = Math.max(0, baselineTotal - totalReduction);
    const carbonReduction = baselineTotal > 0 ? Math.min(100, (totalReduction / baselineTotal) * 100) : 0;
    const sustainabilityScore = Math.min(100, Math.round(50 + carbonReduction * 0.5));

    return {
      carbonEmissions: Math.round(newEmissions * 10) / 10,
      moneySavings: Math.round(totalMoneySaved * 100) / 100,
      carbonReduction: Math.round(carbonReduction * 10) / 10,
      sustainabilityScore,
    };
  }, [sliders]);

  const reset = useCallback(() => {
    setSliders(DEFAULT_SLIDERS);
  }, []);

  return { sliders, result, updateSlider, reset };
}
