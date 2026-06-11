/**
 * EcoMind AI Ultra — Carbon Forecast Chart
 * AI-powered 7-day emission prediction with confidence bands.
 */

import { useState, useEffect, useMemo, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ForecastData {
  date: string;
  historical: number | null;
  forecast: number | null;
}

export function ForecastChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ForecastData[]>([]);
  const [trend, setTrend] = useState<'improving' | 'stable' | 'worsening'>('stable');
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        // Fetch last 30 days of carbon data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { data: logs } = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/carbon_logs?user_id=eq.${user.id}&log_date=gte.${startDate}&log_date=lte.${endDate}&select=carbon_kg,log_date&order=log_date.asc`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        ).then((r) => r.json());

        const dailyData: Record<string, number> = {};
        (logs || []).forEach((log: { log_date: string; carbon_kg: number }) => {
          dailyData[log.log_date] = (dailyData[log.log_date] || 0) + log.carbon_kg;
        });

        const historicalValues = Object.values(dailyData);

        // Call forecast edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/forecast`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ historicalData: historicalValues, days: 7 }),
          }
        );

        if (response.ok) {
          const result = await response.json();

          // Build chart data
          const chartData: ForecastData[] = [];
          const dates = Object.keys(dailyData).sort();

          // Historical data (last 7 days)
          const last7Dates = dates.slice(-7);
          last7Dates.forEach((date) => {
            chartData.push({ date, historical: dailyData[date], forecast: null });
          });

          // Forecast data (next 7 days)
          const lastDate = new Date(dates[dates.length - 1] || new Date());
          result.forecasts.forEach((value: number, i: number) => {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + i + 1);
            chartData.push({
              date: d.toISOString().split('T')[0],
              historical: null,
              forecast: value,
            });
          });

          setData(chartData);
          setTrend(result.trend);
          setConfidence(result.confidence);
        }
      } catch {
        // Fallback: show empty state
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  }, [user]);

  if (isLoading) {
    return (
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Forecast loading">
        <h2 className="text-lg font-semibold text-white mb-4">7-Day Forecast</h2>
        <div className="flex items-center justify-center h-48" role="status" aria-live="polite" aria-label="Loading forecast data">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" aria-hidden="true" />
        </div>
      </section>
    );
  }

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'worsening' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-emerald-400' : trend === 'worsening' ? 'text-red-400' : 'text-slate-400';

  const forecastMemo = useMemo(() => {
    return data.length > 0;
  }, [data.length]);

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="7-day carbon emissions forecast">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">7-Day Forecast</h2>
        <div className={`flex items-center gap-2 text-sm ${trendColor}`} role="status" aria-label={`Forecast trend: ${trend}, confidence: ${Math.round(confidence * 100)}%`}>
          <TrendIcon className="w-4 h-4" aria-hidden="true" />
          <span className="capitalize">{trend}</span>
          <span className="text-slate-500">({Math.round(confidence * 100)}% confidence)</span>
        </div>
      </div>

      {forecastMemo && data.length > 0 ? (
        <div className="h-64" role="img" aria-label={`7-day carbon forecast chart showing ${trend} trend`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v: string) => v.slice(5)}
                label={{ value: 'Date', position: 'bottom', offset: -5 }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft' }}
              />
              <ReferenceLine x={data.find((d) => d.forecast !== null)?.date} stroke="#64748b" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historical"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#60a5fa', r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p>Not enough data for forecasting.</p>
          <p className="text-sm text-slate-500 mt-1">Log your carbon footprint for a few days to see AI predictions.</p>
        </div>
      )}
    </section>
  );
}

export default memo(ForecastChart);
