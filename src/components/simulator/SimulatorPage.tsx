/**
 * EcoMind AI Ultra — Simulator Page
 * Combines future carbon simulator and digital twin.
 */

import { FutureSimulator } from './FutureSimulator';
import { DigitalTwinPage } from './DigitalTwinPage';
import { useState } from 'react';
import { Settings, GitCompare } from 'lucide-react';

export function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'digital-twin'>('simulator');

  return (
    <main className="space-y-6" role="main">
      <header>
        <h1 className="text-2xl font-bold text-white">Carbon Simulator</h1>
        <p className="text-slate-400 mt-1">Explore different futures and optimize your sustainability.</p>
      </header>

      <nav className="flex gap-2 bg-slate-800/50 rounded-xl p-1 w-fit" role="tablist" aria-label="Simulator navigation">
        <button
          onClick={() => setActiveTab('simulator')}
          role="tab"
          aria-selected={activeTab === 'simulator'}
          aria-label="Lifestyle Simulator tab"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'simulator'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Lifestyle Simulator
        </button>
        <button
          onClick={() => setActiveTab('digital-twin')}
          role="tab"
          aria-selected={activeTab === 'digital-twin'}
          aria-label="Digital Twin tab"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'digital-twin'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitCompare className="w-4 h-4" aria-hidden="true" />
          Digital Twin
        </button>
      </nav>

      <section role="tabpanel" aria-label={activeTab === 'simulator' ? 'Lifestyle Simulator' : 'Digital Twin'}>
        {activeTab === 'simulator' ? <FutureSimulator /> : <DigitalTwinPage />}
      </section>
    </main>
  );
}
