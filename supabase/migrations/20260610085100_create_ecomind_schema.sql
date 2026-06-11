/*
# EcoMind AI Ultra — Complete Database Schema

## Overview
Production-grade schema for an AI-powered Carbon Footprint Awareness Platform.
Supports user profiles, carbon footprint logging, gamification, AI coaching,
forecasting, digital twin simulations, and comprehensive analytics.

## New Tables
1. `profiles` — Extended user profiles with sustainability preferences
2. `carbon_logs` — Daily carbon footprint entries by category
3. `categories` — Emission categories (transport, energy, food, shopping, travel)
4. `emission_factors` — Scientific EPA-based emission factors per activity
5. `eco_points` — Gamification points and XP tracking
6. `badges` — Achievement badges definitions
7. `user_badges` — User-earned badges
8. `quests` — Sustainability quests/missions
9. `user_quests` — User quest progress
10. `ai_coach_sessions` — AI coaching conversation history
11. `carbon_forecasts` — AI-generated emission predictions
12. `digital_twin_scenarios` — Lifestyle simulation scenarios
13. `streaks` — Daily logging streak tracking
14. `leaderboard_entries` — Weekly/monthly leaderboard data
15. `carbon_budgets` — Monthly carbon budget settings

## Security
- RLS enabled on all tables
- Owner-scoped policies for authenticated users
- Audit-friendly design with created_at/updated_at timestamps
*/

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  age integer CHECK (age >= 0 AND age <= 120),
  occupation text,
  budget_level text CHECK (budget_level IN ('low', 'medium', 'high')),
  location_type text CHECK (location_type IN ('urban', 'suburban', 'rural')),
  sustainability_goals text[],
  transport_habits text,
  food_habits text,
  shopping_habits text,
  eco_score integer DEFAULT 0 CHECK (eco_score >= 0 AND eco_score <= 100),
  total_carbon_saved numeric(12,4) DEFAULT 0,
  total_money_saved numeric(12,2) DEFAULT 0,
  xp integer DEFAULT 0 CHECK (xp >= 0),
  level integer DEFAULT 1 CHECK (level >= 1),
  eco_class text DEFAULT 'Seedling' CHECK (eco_class IN ('Seedling', 'Sprout', 'Sapling', 'Tree', 'Forest Guardian', 'Earth Protector')),
  avatar_stage integer DEFAULT 1 CHECK (avatar_stage >= 1 AND avatar_stage <= 6),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- EMISSION CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  icon_name text,
  color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Seed default categories
INSERT INTO categories (name, display_name, description, icon_name, color)
VALUES
  ('transport', 'Transportation', 'Daily transport emissions including car, bus, train, bike', 'Car', '#3b82f6'),
  ('energy', 'Energy', 'Home energy usage including electricity, gas, heating', 'Zap', '#f59e0b'),
  ('food', 'Food', 'Dietary emissions including meat, dairy, plant-based', 'Apple', '#22c55e'),
  ('shopping', 'Shopping', 'Consumption emissions from purchases', 'ShoppingBag', '#a855f7'),
  ('travel', 'Travel', 'Long-distance travel by air, rail, car', 'Plane', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- EMISSION FACTORS (scientific carbon coefficients)
-- =====================================================
CREATE TABLE IF NOT EXISTS emission_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  unit text NOT NULL,
  factor numeric(12,6) NOT NULL,
  source text,
  region text DEFAULT 'global',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_emission_factors" ON emission_factors;
CREATE POLICY "select_emission_factors" ON emission_factors FOR SELECT
  TO anon, authenticated USING (true);

-- Seed some emission factors
INSERT INTO emission_factors (category_id, activity_name, unit, factor, source, description)
SELECT c.id, 'Gasoline car (per km)', 'km', 0.170, 'EPA', 'Average gasoline passenger vehicle'
FROM categories c WHERE c.name = 'transport'
ON CONFLICT DO NOTHING;

INSERT INTO emission_factors (category_id, activity_name, unit, factor, source, description)
SELECT c.id, 'Electricity (per kWh)', 'kWh', 0.400, 'EPA', 'Average grid electricity emissions'
FROM categories c WHERE c.name = 'energy'
ON CONFLICT DO NOTHING;

INSERT INTO emission_factors (category_id, activity_name, unit, factor, source, description)
SELECT c.id, 'Beef (per kg)', 'kg', 27.0, 'EPA', 'Beef production emissions'
FROM categories c WHERE c.name = 'food'
ON CONFLICT DO NOTHING;

INSERT INTO emission_factors (category_id, activity_name, unit, factor, source, description)
SELECT c.id, 'Clothing item', 'item', 10.0, 'EPA', 'Average clothing purchase'
FROM categories c WHERE c.name = 'shopping'
ON CONFLICT DO NOTHING;

INSERT INTO emission_factors (category_id, activity_name, unit, factor, source, description)
SELECT c.id, 'Flight (per km)', 'km', 0.255, 'EPA', 'Average commercial flight'
FROM categories c WHERE c.name = 'travel'
ON CONFLICT DO NOTHING;

-- =====================================================
-- CARBON LOGS (user footprint entries)
-- =====================================================
CREATE TABLE IF NOT EXISTS carbon_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  activity_name text NOT NULL,
  quantity numeric(12,4) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  emission_factor numeric(12,6) NOT NULL,
  carbon_kg numeric(12,4) NOT NULL,
  notes text,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE carbon_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_logs" ON carbon_logs;
CREATE POLICY "select_own_logs" ON carbon_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_logs" ON carbon_logs;
CREATE POLICY "insert_own_logs" ON carbon_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_logs" ON carbon_logs;
CREATE POLICY "update_own_logs" ON carbon_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_logs" ON carbon_logs;
CREATE POLICY "delete_own_logs" ON carbon_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_date ON carbon_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_carbon_logs_category ON carbon_logs(category_id);

-- =====================================================
-- CARBON BUDGETS
-- =====================================================
CREATE TABLE IF NOT EXISTS carbon_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_budget_kg numeric(12,4) NOT NULL DEFAULT 500,
  daily_budget_kg numeric(12,4) GENERATED ALWAYS AS (monthly_budget_kg / 30) STORED,
  warning_threshold numeric(3,2) NOT NULL DEFAULT 0.80 CHECK (warning_threshold > 0 AND warning_threshold <= 1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carbon_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_budget" ON carbon_budgets;
CREATE POLICY "select_own_budget" ON carbon_budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_budget" ON carbon_budgets;
CREATE POLICY "insert_own_budget" ON carbon_budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_budget" ON carbon_budgets;
CREATE POLICY "update_own_budget" ON carbon_budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STREAKS
-- =====================================================
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_log_date date,
  streak_protection_tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_streak" ON streaks;
CREATE POLICY "select_own_streak" ON streaks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_streak" ON streaks;
CREATE POLICY "insert_own_streak" ON streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_streak" ON streaks;
CREATE POLICY "update_own_streak" ON streaks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text NOT NULL,
  icon_name text,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  xp_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_badges" ON badges;
CREATE POLICY "select_badges" ON badges FOR SELECT
  TO anon, authenticated USING (true);

-- Seed badges
INSERT INTO badges (name, display_name, description, icon_name, rarity, requirement_type, requirement_value, xp_reward)
VALUES
  ('first_log', 'First Step', 'Log your first carbon entry', 'Footprints', 'common', 'logs_count', 1, 10),
  ('week_warrior', 'Week Warrior', 'Log for 7 consecutive days', 'Flame', 'uncommon', 'streak_days', 7, 50),
  ('month_master', 'Month Master', 'Log for 30 consecutive days', 'Calendar', 'rare', 'streak_days', 30, 200),
  ('carbon_saver_100', 'Carbon Saver', 'Save 100kg of carbon', 'Leaf', 'uncommon', 'carbon_saved', 100, 100),
  ('transport_hero', 'Transport Hero', 'Reduce transport emissions by 20%', 'Bus', 'rare', 'category_reduction', 20, 150),
  ('energy_guru', 'Energy Guru', 'Reduce energy emissions by 20%', 'Zap', 'rare', 'category_reduction', 20, 150),
  ('food_philosopher', 'Food Philosopher', 'Log 50 plant-based meals', 'Apple', 'epic', 'activity_count', 50, 250),
  ('earth_protector', 'Earth Protector', 'Reach Earth Protector class', 'Globe', 'legendary', 'level_reached', 50, 1000)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USER BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_badges" ON user_badges;
CREATE POLICY "select_own_badges" ON user_badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_badges" ON user_badges;
CREATE POLICY "insert_own_badges" ON user_badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- QUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text NOT NULL,
  category text CHECK (category IN ('food', 'energy', 'shopping', 'transport', 'travel', 'general')),
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  xp_reward integer DEFAULT 0,
  eco_points_reward integer DEFAULT 0,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  duration_days integer DEFAULT 7,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quests" ON quests;
CREATE POLICY "select_quests" ON quests FOR SELECT
  TO anon, authenticated USING (true);

-- Seed quests
INSERT INTO quests (name, display_name, description, category, difficulty, xp_reward, eco_points_reward, requirement_type, requirement_value, duration_days)
VALUES
  ('vegan_week', 'Vegan Week', 'Eat only plant-based meals for 7 days', 'food', 'medium', 100, 50, 'plant_meals', 21, 7),
  ('bike_commute', 'Bike Commute', 'Cycle to work 5 days this week', 'transport', 'medium', 80, 40, 'bike_trips', 5, 7),
  ('energy_audit', 'Energy Audit', 'Reduce home energy by 10% this week', 'energy', 'easy', 60, 30, 'energy_reduction', 10, 7),
  ('no_shopping', 'Conscious Consumer', 'No non-essential purchases for 7 days', 'shopping', 'hard', 120, 60, 'no_purchase_days', 7, 7),
  ('public_transport', 'Transit Hero', 'Use public transport 10 times this week', 'transport', 'easy', 70, 35, 'transit_trips', 10, 7)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USER QUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, quest_id)
);

ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_quests" ON user_quests;
CREATE POLICY "select_own_quests" ON user_quests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_quests" ON user_quests;
CREATE POLICY "insert_own_quests" ON user_quests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_quests" ON user_quests;
CREATE POLICY "update_own_quests" ON user_quests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- AI COACH SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_coach_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_coach" ON ai_coach_sessions;
CREATE POLICY "select_own_coach" ON ai_coach_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_coach" ON ai_coach_sessions;
CREATE POLICY "insert_own_coach" ON ai_coach_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_coach_sessions_user ON ai_coach_sessions(user_id, created_at DESC);

-- =====================================================
-- CARBON FORECASTS
-- =====================================================
CREATE TABLE IF NOT EXISTS carbon_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_date date NOT NULL,
  predicted_carbon_kg numeric(12,4) NOT NULL,
  confidence numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  category_breakdown jsonb DEFAULT '{}',
  trend_direction text CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  ai_reasoning text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE carbon_forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_forecasts" ON carbon_forecasts;
CREATE POLICY "select_own_forecasts" ON carbon_forecasts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_forecasts" ON carbon_forecasts;
CREATE POLICY "insert_own_forecasts" ON carbon_forecasts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_forecasts_user_date ON carbon_forecasts(user_id, forecast_date);

-- =====================================================
-- DIGITAL TWIN SCENARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS digital_twin_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_name text NOT NULL,
  scenario_type text NOT NULL CHECK (scenario_type IN ('current', 'public_transport', 'vegetarian', 'reduced_shopping', 'renewable_energy', 'custom')),
  parameters jsonb NOT NULL DEFAULT '{}',
  projected_carbon_kg numeric(12,4),
  projected_savings_kg numeric(12,4),
  projected_money_saved numeric(12,2),
  success_probability numeric(3,2) CHECK (success_probability >= 0 AND success_probability <= 1),
  environmental_impact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE digital_twin_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scenarios" ON digital_twin_scenarios;
CREATE POLICY "select_own_scenarios" ON digital_twin_scenarios FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scenarios" ON digital_twin_scenarios;
CREATE POLICY "insert_own_scenarios" ON digital_twin_scenarios FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- LEADERBOARD ENTRIES
-- =====================================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  carbon_saved_kg numeric(12,4) DEFAULT 0,
  xp_earned integer DEFAULT 0,
  quests_completed integer DEFAULT 0,
  rank integer,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_leaderboard" ON leaderboard_entries;
CREATE POLICY "select_leaderboard" ON leaderboard_entries FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period, period_start DESC);

-- =====================================================
-- AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit" ON audit_logs;
CREATE POLICY "select_own_audit" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
