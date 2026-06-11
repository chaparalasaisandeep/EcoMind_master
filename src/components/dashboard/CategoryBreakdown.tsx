/**
 * EcoMind AI Ultra — Category Breakdown Chart
 * Interactive pie/bar chart showing emission distribution.
 */

import { useState, useMemo, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface CategoryData {
  category_name: string;
  display_name: string;
  total_carbon: number;
  log_count: number;
  percentage: number;
  color: string | null;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: d.display_name,
      value: d.total_carbon,
      color: d.color || '#64748b',
      percentage: d.percentage,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { percentage: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-emerald-400">{payload[0].value.toFixed(1)} kg CO2e</p>
          <p className="text-slate-400">{payload[0].payload.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Carbon emissions breakdown by category">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Emission Breakdown</h2>
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1" role="group" aria-label="Chart type selection">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'pie' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={chartType === 'pie'}
            aria-label="Switch to pie chart view"
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'bar' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={chartType === 'bar'}
            aria-label="Switch to bar chart view"
          >
            Bar
          </button>
        </div>
      </div>

      <div className="h-64" role="img" aria-label={`${chartType} chart showing emission distribution across categories`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => <span className="text-slate-300 text-sm">{value}</span>}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default memo(CategoryBreakdown);
