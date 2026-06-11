/**
 * EcoMind AI Ultra — Type Definitions
 * Centralized type system for type safety across the application.
 */

// =====================================================
// Core Entity Types
// =====================================================

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  age: number | null;
  occupation: string | null;
  budget_level: 'low' | 'medium' | 'high' | null;
  location_type: 'urban' | 'suburban' | 'rural' | null;
  sustainability_goals: string[] | null;
  transport_habits: string | null;
  food_habits: string | null;
  shopping_habits: string | null;
  eco_score: number;
  total_carbon_saved: number;
  total_money_saved: number;
  xp: number;
  level: number;
  eco_class: string;
  avatar_stage: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_name: string | null;
  color: string | null;
  created_at: string;
}

export interface EmissionFactor {
  id: string;
  category_id: string;
  activity_name: string;
  unit: string;
  factor: number;
  source: string | null;
  region: string;
  description: string | null;
  created_at: string;
}

export interface CarbonLog {
  id: string;
  user_id: string;
  category_id: string | null;
  activity_name: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  carbon_kg: number;
  notes: string | null;
  log_date: string;
  created_at: string;
}

// =====================================================
// Gamification Types
// =====================================================

export interface Badge {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon_name: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Quest {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: 'food' | 'energy' | 'shopping' | 'transport' | 'travel' | 'general' | null;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | null;
  xp_reward: number;
  eco_points_reward: number;
  requirement_type: string;
  requirement_value: number;
  duration_days: number;
  created_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  quest?: Quest;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  streak_protection_tokens: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// AI & Analytics Types
// =====================================================

export interface AiCoachMessage {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant' | 'system';
  context: Record<string, unknown>;
  created_at: string;
}

export interface CarbonForecast {
  id: string;
  user_id: string;
  forecast_date: string;
  predicted_carbon_kg: number;
  confidence: number;
  category_breakdown: Record<string, number>;
  trend_direction: 'improving' | 'stable' | 'worsening';
  ai_reasoning: string | null;
  created_at: string;
}

export interface DigitalTwinScenario {
  id: string;
  user_id: string;
  scenario_name: string;
  scenario_type: 'current' | 'public_transport' | 'vegetarian' | 'reduced_shopping' | 'renewable_energy' | 'custom';
  parameters: Record<string, unknown>;
  projected_carbon_kg: number | null;
  projected_savings_kg: number | null;
  projected_money_saved: number | null;
  success_probability: number | null;
  environmental_impact: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period: 'weekly' | 'monthly' | 'all_time';
  carbon_saved_kg: number;
  xp_earned: number;
  quests_completed: number;
  rank: number | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface CarbonBudget {
  id: string;
  user_id: string;
  monthly_budget_kg: number;
  daily_budget_kg: number;
  warning_threshold: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Dashboard & Analytics Types
// =====================================================

export interface HeatmapData {
  log_date: string;
  total_carbon: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface CategoryBreakdown {
  category_name: string;
  display_name: string;
  total_carbon: number;
  log_count: number;
  percentage: number;
  color: string | null;
}

export interface MonthlySummary {
  month: number;
  month_name: string;
  total_carbon: number;
  avg_daily: number;
  trend: string;
}

export interface DailyStats {
  date: string;
  totalCarbon: number;
  categoryBreakdown: Record<string, number>;
  budgetUsed: number;
  budgetRemaining: number;
}

// =====================================================
// Simulator Types
// =====================================================

export interface SimulatorSlider {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  category: string;
}

export interface SimulatorResult {
  carbonEmissions: number;
  moneySavings: number;
  carbonReduction: number;
  sustainabilityScore: number;
}

// =====================================================
// UI & Form Types
// =====================================================

export interface LogFormData {
  categoryId: string;
  activityName: string;
  quantity: number;
  unit: string;
  notes: string;
  logDate: string;
}

export interface ProfileFormData {
  displayName: string;
  age: number | null;
  occupation: string;
  budgetLevel: 'low' | 'medium' | 'high';
  locationType: 'urban' | 'suburban' | 'rural';
  sustainabilityGoals: string[];
  transportHabits: string;
  foodHabits: string;
  shoppingHabits: string;
}

// =====================================================
// API Response Types
// =====================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
