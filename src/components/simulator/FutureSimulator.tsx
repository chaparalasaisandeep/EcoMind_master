/**
 * EcoMind AI Ultra — Future Carbon Simulator
 * Interactive lifestyle change simulator with real-time projections.
 */

import { useSimulator } from '../../hooks/useSimulator';
import { Slider } from '../common/Slider';
import { Leaf, DollarSign, TrendingDown, Award } from 'lucide-react';
import { memo } from 'react';

export function FutureSimulator() {
  const { sliders, result, updateSlider, reset } = useSimulator();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <section className="space-y-6" role="region" aria-label="Future carbon simulator">
      <header>
        <h1 className="text-2xl font-bold text-white">Future Carbon Simulator</h1>
        <p className="text-slate-400 mt-1">
          Adjust the sliders to see how lifestyle changes affect your carbon footprint.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 space-y-6" aria-label="Lifestyle adjustment controls">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lifestyle Adjustments</h2>
            <button
              onClick={reset}
              className="text-sm text-slate-400 hover:text-white transition-colors"
              aria-label="Reset all sliders to default values"
            >
              Reset
            </button>
          </div>

          {sliders.map((slider) => (
            <Slider
              key={slider.id}
              label={slider.label}
              value={slider.value}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              unit={slider.unit}
              onChange={(v) => updateSlider(slider.id, v)}
            />
          ))}
        </section>

        {/* Results */}
        <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Projected impact results" aria-live="polite">
          <h2 className="text-lg font-semibold text-white mb-4">Projected Impact</h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-400">Monthly Emissions</p>
                  <p className="text-2xl font-bold text-white">{result.carbonEmissions} kg CO2e</p>
                  <p className="text-xs text-emerald-400/70 mt-1">≈ {(result.carbonEmissions / 0.12).toFixed(1)} km driving equivalent</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-400">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-400">${result.moneySavings}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-400">Carbon Reduction</p>
                  <p className="text-2xl font-bold text-blue-400">{result.carbonReduction}%</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <div>
                  <p className="text-sm text-slate-400">Sustainability Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(result.sustainabilityScore)}`}>
                    {result.sustainabilityScore} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Sustainability Score</span>
              <span className={getScoreColor(result.sustainabilityScore)}>{result.sustainabilityScore}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={result.sustainabilityScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Sustainability score progress: ${result.sustainabilityScore} percent`}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${result.sustainabilityScore}%`,
                  backgroundColor: result.sustainabilityScore >= 80 ? '#34d399' : result.sustainabilityScore >= 60 ? '#fbbf24' : '#f87171',
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default memo(FutureSimulator);
