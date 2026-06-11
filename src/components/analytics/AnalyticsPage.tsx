/**
 * EcoMind AI Ultra — Analytics Page
 * Comprehensive analytics with monthly trends and hotspot detection.
 */

import { useAnalytics } from '../../hooks/useAnalytics';
import { CategoryBreakdown } from '../dashboard/CategoryBreakdown';
import { HeatmapCalendar } from '../dashboard/HeatmapCalendar';
import { ForecastChart } from './ForecastChart';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';

export function AnalyticsPage() {
  const { heatmap, categoryBreakdown, monthlySummary, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-label="Loading analytics data">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" aria-hidden="true" />
        <span className="ml-3 text-slate-400">Loading analytics...</span>
      </div>
    );
  }

  // Find highest emission category (hotspot)
  const hotspot = categoryBreakdown.length > 0
    ? categoryBreakdown.reduce((max, cat) => cat.total_carbon > max.total_carbon ? cat : max, categoryBreakdown[0])
    : null;

  return (
    <main className="space-y-6" role="main">
      <header>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Deep insights into your carbon footprint patterns.</p>
      </header>

      {/* Hotspot Detection */}
      {hotspot && hotspot.total_carbon > 0 && (
        <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6" role="alert" aria-label="Carbon hotspot warning">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-300">Carbon Hotspot Detected</h3>
              <p className="text-amber-200/80 mt-1">
                Your <strong>{hotspot.display_name}</strong> emissions are highest at{' '}
                <strong>{hotspot.total_carbon.toFixed(1)} kg CO2e</strong> ({hotspot.percentage}% of total).
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-300">
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                <span>Focus here for maximum impact reduction.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown data={categoryBreakdown} />
        <ForecastChart />
      </div>

      {/* Monthly Summary */}
      {monthlySummary.length > 0 && (
        <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Monthly carbon summary">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Summary {new Date().getFullYear()}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Monthly carbon emissions and trends">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-2 px-4">Month</th>
                  <th className="text-right py-2 px-4">Total (kg CO2e)</th>
                  <th className="text-right py-2 px-4">Daily Avg (kg CO2e)</th>
                  <th className="text-right py-2 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m) => (
                  <tr key={m.month} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <time dateTime={`${new Date().getFullYear()}-${String(m.month).padStart(2, '0')}`}>
                        {m.month_name.trim()}
                      </time>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{m.total_carbon.toFixed(1)} kg CO2e</td>
                    <td className="py-3 px-4 text-right text-slate-400">{m.avg_daily.toFixed(1)} kg CO2e</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 ${
                        m.trend === 'improving' ? 'text-emerald-400' : m.trend === 'worsening' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {m.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <HeatmapCalendar data={heatmap} />
    </main>
  );
}
