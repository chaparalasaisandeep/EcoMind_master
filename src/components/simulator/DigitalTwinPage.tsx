/**
 * EcoMind AI Ultra — Digital Twin Page
 * AI-powered lifestyle scenario simulator with alternate futures.
 */

import { useState } from 'react';
import { useDigitalTwin } from '../../hooks/useDigitalTwin';
import { useAuth } from '../../context/AuthContext';
import { Loader2, GitCompare, Leaf, DollarSign, TrendingUp, Target } from 'lucide-react';
import type { DigitalTwinScenario } from '../../types';

const SCENARIO_TYPES: Array<{ id: DigitalTwinScenario['scenario_type']; label: string; description: string }> = [
  { id: 'current', label: 'Current Lifestyle', description: 'Your baseline emissions if habits continue unchanged.' },
  { id: 'public_transport', label: 'Public Transport', description: 'Switch 35% of car trips to public transit.' },
  { id: 'vegetarian', label: 'Vegetarian Diet', description: 'Replace meat with plant-based alternatives.' },
  { id: 'reduced_shopping', label: 'Conscious Consumer', description: 'Reduce non-essential purchases by 30%.' },
  { id: 'renewable_energy', label: 'Renewable Energy', description: 'Switch to 60% renewable energy sources.' },
];

export function DigitalTwinPage() {
  const { user } = useAuth();
  const { scenarios, isLoading, generateScenario } = useDigitalTwin();
  const [selectedScenario, setSelectedScenario] = useState<DigitalTwinScenario['scenario_type']>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<Record<string, DigitalTwinScenario>>({});

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);

    const { data } = await generateScenario(selectedScenario, {});
    if (data) {
      setGeneratedResults((prev) => ({ ...prev, [selectedScenario]: data as DigitalTwinScenario }));
    }

    setIsGenerating(false);
  };

  return (
    <section className="space-y-6" role="region" aria-label="Carbon digital twin simulator">
      <header>
        <h1 className="text-2xl font-bold text-white">Carbon Digital Twin</h1>
        <p className="text-slate-400 mt-1">
          Simulate alternate futures and see how lifestyle changes impact your carbon footprint.
        </p>
      </header>

      {/* Scenario Selection */}
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Scenario selection">
        <h2 className="text-lg font-semibold text-white mb-4">Choose a Scenario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="group" aria-label="Available scenarios">
          {SCENARIO_TYPES.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              role="radio"
              aria-checked={selectedScenario === scenario.id}
              aria-label={`${scenario.label}: ${scenario.description}`}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedScenario === scenario.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
              }`}
            >
              <p className={`font-medium ${selectedScenario === scenario.id ? 'text-emerald-400' : 'text-white'}`}>
                {scenario.label}
              </p>
              <p className="text-xs text-slate-400 mt-1">{scenario.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          aria-label={isGenerating ? 'Simulation in progress' : 'Run simulation for selected scenario'}
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Simulating...
            </>
          ) : (
            <>
              <GitCompare className="w-5 h-5" aria-hidden="true" />
              Run Simulation
            </>
          )}
        </button>
      </section>

      {/* Results */}
      {Object.keys(generatedResults).length > 0 && (
        <section className="space-y-4" aria-label="Simulation results" aria-live="polite">
          <h2 className="text-lg font-semibold text-white">Simulation Results</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(generatedResults).map((result) => (
              <article
                key={result.id}
                className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6"
                aria-label={`${result.scenario_name} scenario results`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">{result.scenario_name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <Leaf className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">Projected Emissions</p>
                      <p className="text-lg font-bold text-white">{result.projected_carbon_kg?.toFixed(1)} kg CO2e/mo</p>
                      <p className="text-xs text-emerald-400/70 mt-1">≈ {((result.projected_carbon_kg ?? 0) / 21).toFixed(2)} trees sequestered annually</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">Carbon Savings</p>
                      <p className="text-lg font-bold text-emerald-400">{result.projected_savings_kg?.toFixed(1)} kg CO2e/mo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">Money Saved</p>
                      <p className="text-lg font-bold text-green-400">${result.projected_money_saved?.toFixed(2)}/mo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <Target className="w-5 h-5 text-amber-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">Success Probability</p>
                      <p className="text-lg font-bold text-amber-400">{Math.round((result.success_probability || 0) * 100)}%</p>
                    </div>
                  </div>
                </div>

                {result.environmental_impact && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" role="status">
                    <p className="text-sm text-emerald-300">{result.environmental_impact}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
