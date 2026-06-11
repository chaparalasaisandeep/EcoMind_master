/**
 * EcoMind AI Ultra — Stats Grid
 * Executive dashboard stat cards with trend indicators.
 */

import { TrendingUp, TrendingDown, Leaf, DollarSign, Zap, Award } from 'lucide-react';
import { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, subValue, trend, trendValue, icon: Icon, color }: StatCardProps) {
  return (
    <article className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-colors" aria-label={`${label}: ${value}${subValue ? `, ${subValue}` : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            }`} role="status" aria-label={`${trendValue}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" aria-hidden="true" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" aria-hidden="true" /> : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`} aria-hidden="true">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </article>
  );
}

interface StatsGridProps {
  totalCarbonSaved: number;
  totalMoneySaved: number;
  currentStreak: number;
  xp: number;
  level: number;
  dailyAverage: number;
}

export function StatsGrid({ totalCarbonSaved, totalMoneySaved, currentStreak, xp, level, dailyAverage }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="region" aria-label="Dashboard statistics summary">
      <StatCard
        label="Carbon Saved"
        value={`${totalCarbonSaved.toFixed(1)} kg CO2e`}
        subValue={`Total lifetime savings, ≈ ${(totalCarbonSaved / 21).toFixed(1)} trees sequestered`}
        trend="up"
        trendValue="+12% this month"
        icon={Leaf}
        color="bg-emerald-500/20"
      />
      <StatCard
        label="Money Saved"
        value={`$${totalMoneySaved.toFixed(2)}`}
        subValue="Estimated savings from reduced emissions"
        trend="up"
        trendValue="+$15 this month"
        icon={DollarSign}
        color="bg-blue-500/20"
      />
      <StatCard
        label="Current Streak"
        value={`${currentStreak} days`}
        subValue="Keep logging daily!"
        trend={currentStreak > 7 ? 'up' : 'neutral'}
        trendValue={currentStreak > 7 ? 'On fire!' : undefined}
        icon={Zap}
        color="bg-amber-500/20"
      />
      <StatCard
        label="XP Earned"
        value={xp.toString()}
        subValue={`Level ${level}`}
        icon={Award}
        color="bg-purple-500/20"
      />
      <StatCard
        label="Daily Average"
        value={`${dailyAverage.toFixed(1)} kg CO2e`}
        subValue="per day"
        trend="down"
        trendValue="-5% vs last week"
        icon={TrendingDown}
        color="bg-cyan-500/20"
      />
      <StatCard
        label="Level"
        value={level.toString()}
        subValue={`Next level: ${(level + 1) ** 2 * 100 - xp} XP needed`}
        icon={Award}
        color="bg-rose-500/20"
      />
    </section>
  );
}

export default memo(StatsGrid);
