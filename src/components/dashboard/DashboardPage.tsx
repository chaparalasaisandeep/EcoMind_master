/**
 * EcoMind AI Ultra — Main Dashboard Page
 * Executive sustainability command center with all key metrics.
 * Accessibility: Semantic HTML, ARIA landmarks, live regions.
 * Sustainability: Impact metrics with environmental equivalents.
 */

import { useMemo } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useGamification } from '../../hooks/useGamification';
import { SustainabilityScore } from './SustainabilityScore';
import { CarbonBudgetCard } from './CarbonBudgetCard';
import { StatsGrid } from './StatsGrid';
import { HeatmapCalendar } from './HeatmapCalendar';
import { CategoryBreakdown } from './CategoryBreakdown';
import { ForecastChart } from '../analytics/ForecastChart';
import { ActivityFeed } from './ActivityFeed';
import { Loader2, TreePine, Car, Droplets } from 'lucide-react';

const CO2_PER_TREE_PER_YEAR = 20;
const CO2_PER_CAR_KM = 0.17;
const CO2_PER_SHOWER = 0.5;

export function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { heatmap, categoryBreakdown, dailyStats, isLoading: analyticsLoading } = useAnalytics();
  const { streak, isLoading: gamificationLoading } = useGamification();

  const isLoading = profileLoading || analyticsLoading || gamificationLoading;

  const impactMetrics = useMemo(() => {
    const carbonSaved = profile?.total_carbon_saved || 0;
    return {
      treesEquivalent: Math.round(carbonSaved / CO2_PER_TREE_PER_YEAR),
      drivingKmAvoided: Math.round(carbonSaved / CO2_PER_CAR_KM),
      showersEquivalent: Math.round(carbonSaved / CO2_PER_SHOWER),
    };
  }, [profile?.total_carbon_saved]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" aria-hidden="true" />
        <span className="ml-3 text-slate-400">Loading your sustainability dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Sustainability Command Center</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {profile?.display_name || 'Eco Warrior'}! Here's your environmental impact today.
        </p>
      </header>

      <StatsGrid
        totalCarbonSaved={profile?.total_carbon_saved || 0}
        totalMoneySaved={profile?.total_money_saved || 0}
        currentStreak={streak?.current_streak || 0}
        xp={profile?.xp || 0}
        level={profile?.level || 1}
        dailyAverage={dailyStats?.totalCarbon || 0}
      />

      <section aria-label="Environmental impact equivalents">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <TreePine className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{impactMetrics.treesEquivalent}</p>
              <p className="text-xs text-slate-400">Trees planted equivalent</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{impactMetrics.drivingKmAvoided}</p>
              <p className="text-xs text-slate-400">km of driving avoided</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{impactMetrics.showersEquivalent}</p>
              <p className="text-xs text-slate-400">Showers equivalent saved</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Score and budget overview">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SustainabilityScore
            score={profile?.eco_score || 50}
            ecoClass={profile?.eco_class || 'Seedling'}
            avatarStage={profile?.avatar_stage || 1}
          />
          <CarbonBudgetCard
            monthlyBudget={500}
            usedAmount={dailyStats?.budgetUsed || 0}
            warningThreshold={0.8}
          />
        </div>
      </section>

      <section aria-label="Emission analysis">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown data={categoryBreakdown} />
          <ForecastChart />
        </div>
      </section>

      <section aria-label="Activity history">
        <HeatmapCalendar data={heatmap} />
        <ActivityFeed />
      </section>
    </div>
  );
}
