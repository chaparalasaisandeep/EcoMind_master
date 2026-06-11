/**
 * EcoMind AI Ultra — Analytics Hook
 * Fetches dashboard analytics: heatmap, category breakdown, monthly summary.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, carbonLogService } from '../services/api';
import type { HeatmapData, CategoryBreakdown, MonthlySummary, DailyStats } from '../types';
import { DEFAULT_MONTHLY_BUDGET_KG } from '../utils/constants';

interface UseAnalyticsReturn {
  heatmap: HeatmapData[];
  categoryBreakdown: CategoryBreakdown[];
  monthlySummary: MonthlySummary[];
  dailyStats: DailyStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuth();
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    try {
      const [heatmapData, breakdownData, monthlyData] = await Promise.all([
        analyticsService.getHeatmap(user.id, currentYear),
        analyticsService.getCategoryBreakdown(user.id, startDate, endDate),
        analyticsService.getMonthlySummary(user.id, currentYear),
      ]);

      setHeatmap(heatmapData);
      setCategoryBreakdown(breakdownData);
      setMonthlySummary(monthlyData);

      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await carbonLogService.getByUserId(user.id, {
        start: today,
        end: today,
      });

      const totalCarbon = todayLogs.reduce((sum, log) => sum + (log.carbon_kg || 0), 0);
      const categoryBreakdownMap: Record<string, number> = {};
      todayLogs.forEach((log) => {
        const cat = log.category_id || 'unknown';
        categoryBreakdownMap[cat] = (categoryBreakdownMap[cat] || 0) + (log.carbon_kg || 0);
      });

      const dailyBudget = DEFAULT_MONTHLY_BUDGET_KG / 30;

      setDailyStats({
        date: today,
        totalCarbon,
        categoryBreakdown: categoryBreakdownMap,
        budgetUsed: totalCarbon,
        budgetRemaining: Math.max(0, dailyBudget - totalCarbon),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    heatmap,
    categoryBreakdown,
    monthlySummary,
    dailyStats,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
