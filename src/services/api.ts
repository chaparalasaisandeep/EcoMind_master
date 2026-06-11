/**
 * EcoMind AI Ultra — Supabase Data Access Service
 * Centralized, reusable service layer for all Supabase operations.
 * Eliminates duplicated queries across hooks.
 */

import { supabase } from '../lib/supabase';
import { fromSupabaseError } from '../errors';
import type {
  Profile,
  CarbonLog,
  LogFormData,
  Badge,
  UserBadge,
  Quest,
  UserQuest,
  Streak,
  LeaderboardEntry,
  HeatmapData,
  CategoryBreakdown,
  MonthlySummary,
  DigitalTwinScenario,
  CarbonBudget,
} from '../types';

// =====================================================
// Profile Service
// =====================================================

export const profileService = {
  async getByUserId(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw fromSupabaseError(error);
    if (!data) throw new Error('Profile not found');
    return data as Profile;
  },

  async update(userId: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw fromSupabaseError(error);
  },

  async create(userId: string, displayName: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert({ user_id: userId, display_name: displayName });

    if (error) throw fromSupabaseError(error);
  },
};

// =====================================================
// Carbon Logs Service
// =====================================================

export const carbonLogService = {
  async getByUserId(
    userId: string,
    dateRange?: { start: string; end: string }
  ): Promise<CarbonLog[]> {
    let query = supabase
      .from('carbon_logs')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (dateRange) {
      query = query.gte('log_date', dateRange.start).lte('log_date', dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as CarbonLog[];
  },

  async add(userId: string, formData: LogFormData): Promise<void> {
    const { data: factorData } = await supabase
      .from('emission_factors')
      .select('factor')
      .eq('category_id', formData.categoryId)
      .maybeSingle();

    const emissionFactor = factorData?.factor ?? 0;
    const carbonKg = formData.quantity * emissionFactor;

    const { error } = await supabase.from('carbon_logs').insert({
      user_id: userId,
      category_id: formData.categoryId,
      activity_name: formData.activityName,
      quantity: formData.quantity,
      unit: formData.unit,
      emission_factor: emissionFactor,
      carbon_kg: carbonKg,
      notes: formData.notes || null,
      log_date: formData.logDate,
    });

    if (error) throw fromSupabaseError(error);
  },

  async delete(userId: string, logId: string): Promise<void> {
    const { error } = await supabase
      .from('carbon_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) throw fromSupabaseError(error);
  },

  async getDailyTotal(userId: string, date: string): Promise<number> {
    const { data } = await supabase
      .from('carbon_logs')
      .select('carbon_kg')
      .eq('user_id', userId)
      .eq('log_date', date);

    return (data ?? []).reduce((sum, log) => sum + (log.carbon_kg || 0), 0);
  },
};

// =====================================================
// Analytics Service
// =====================================================

export const analyticsService = {
  async getHeatmap(userId: string, year: number): Promise<HeatmapData[]> {
    const { data, error } = await supabase.rpc('get_carbon_heatmap', {
      p_user_id: userId,
      p_year: year,
    });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as HeatmapData[];
  },

  async getCategoryBreakdown(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CategoryBreakdown[]> {
    const { data, error } = await supabase.rpc('get_category_breakdown', {
      p_user_id: userId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as CategoryBreakdown[];
  },

  async getMonthlySummary(userId: string, year: number): Promise<MonthlySummary[]> {
    const { data, error } = await supabase.rpc('get_monthly_summary', {
      p_user_id: userId,
      p_year: year,
    });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as MonthlySummary[];
  },
};

// =====================================================
// Gamification Service
// =====================================================

export const gamificationService = {
  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('xp_reward', { ascending: false });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as Badge[];
  },

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as UserBadge[];
  },

  async getQuests(): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('xp_reward', { ascending: false });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as Quest[];
  },

  async getUserQuests(userId: string): Promise<UserQuest[]> {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', userId);
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as UserQuest[];
  },

  async getStreak(userId: string): Promise<Streak | null> {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    return data as Streak | null;
  },

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('period', 'weekly')
      .order('carbon_saved_kg', { ascending: false })
      .limit(limit);
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as LeaderboardEntry[];
  },

  async startQuest(userId: string, questId: string): Promise<void> {
    const { error } = await supabase.from('user_quests').insert({
      user_id: userId,
      quest_id: questId,
      status: 'active',
      progress: 0,
    });
    if (error) throw fromSupabaseError(error);
  },
};

// =====================================================
// Digital Twin Service
// =====================================================

export const digitalTwinService = {
  async getScenarios(userId: string): Promise<DigitalTwinScenario[]> {
    const { data, error } = await supabase
      .from('digital_twin_scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw fromSupabaseError(error);
    return (data ?? []) as DigitalTwinScenario[];
  },

  async saveScenario(
    userId: string,
    scenarioName: string,
    scenarioType: DigitalTwinScenario['scenario_type'],
    parameters: Record<string, unknown>,
    result: {
      projectedCarbonKg?: number;
      projectedSavingsKg?: number;
      projectedMoneySaved?: number;
      successProbability?: number;
      environmentalImpact?: string;
    }
  ): Promise<DigitalTwinScenario> {
    const { data, error } = await supabase
      .from('digital_twin_scenarios')
      .insert({
        user_id: userId,
        scenario_name: scenarioName,
        scenario_type: scenarioType,
        parameters,
        projected_carbon_kg: result.projectedCarbonKg ?? null,
        projected_savings_kg: result.projectedSavingsKg ?? null,
        projected_money_saved: result.projectedMoneySaved ?? null,
        success_probability: result.successProbability ?? null,
        environmental_impact: result.environmentalImpact ?? null,
      })
      .select()
      .single();

    if (error) throw fromSupabaseError(error);
    return data as DigitalTwinScenario;
  },
};

// =====================================================
// Budget Service
// =====================================================

export const budgetService = {
  async getBudget(userId: string): Promise<CarbonBudget | null> {
    const { data, error } = await supabase
      .from('carbon_budgets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    return data as CarbonBudget | null;
  },

  async createDefault(userId: string, monthlyBudgetKg: number = 500): Promise<void> {
    const { error } = await supabase
      .from('carbon_budgets')
      .insert({ user_id: userId, monthly_budget_kg: monthlyBudgetKg });
    if (error) throw fromSupabaseError(error);
  },
};

// =====================================================
// Edge Function Service
// =====================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const edgeFunctionService = {
  async callAiCoach(
    message: string,
    context: Record<string, unknown>,
    history: Array<{ role: string; content: string }> = []
  ): Promise<{ response: string; source: string }> {
    return callEdgeFunction('/functions/v1/ai-coach', {
      message,
      context,
      history,
    });
  },

  async callDigitalTwin(
    userId: string,
    scenarioType: string,
    parameters: Record<string, unknown>
  ): Promise<{
    scenarioName: string;
    projectedCarbonKg: number;
    projectedSavingsKg: number;
    projectedMoneySaved: number;
    carbonReductionPercent: number;
    sustainabilityScore: number;
    successProbability: number;
    categoryImpacts: Record<string, { baseline: number; new: number; reduction: number }>;
    environmentalImpact: string;
  }> {
    return callEdgeFunction('/functions/v1/digital-twin', {
      userId,
      scenarioType,
      parameters,
    });
  },

  async callForecast(
    historicalData: number[],
    days: number = 7
  ): Promise<{
    forecasts: number[];
    confidence: number;
    trend: string;
    reasoning: string;
    generatedAt: string;
  }> {
    return callEdgeFunction('/functions/v1/forecast', {
      historicalData,
      days,
    });
  },
};
