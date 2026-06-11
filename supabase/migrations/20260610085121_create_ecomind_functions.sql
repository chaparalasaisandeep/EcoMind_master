/*
# EcoMind AI Ultra — Database Functions & Triggers

## Overview
Helper functions for streak management, XP/level calculation, leaderboard updates,
and carbon analytics. All functions are security-definer for proper access control.

## New Functions
1. `update_streak` — Updates user streak on new log
2. `calculate_level` — Computes level from XP
3. `update_user_stats` — Aggregates carbon savings and updates profile
4. `get_carbon_heatmap` — Returns daily carbon data for calendar heatmap
5. `get_category_breakdown` — Returns category analytics for a date range
6. `get_monthly_summary` — Returns monthly carbon summary
*/

-- Function to update streak when a new carbon log is added
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date date;
  current_streak integer;
  longest_streak integer;
BEGIN
  SELECT s.last_log_date, s.current_streak, s.longest_streak
  INTO last_date, current_streak, longest_streak
  FROM streaks s WHERE s.user_id = NEW.user_id;

  IF last_date IS NULL THEN
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_log_date)
    VALUES (NEW.user_id, 1, 1, NEW.log_date)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(streaks.longest_streak, 1),
      last_log_date = NEW.log_date,
      updated_at = now();
  ELSIF last_date = NEW.log_date THEN
    -- Same day, no streak change
    NULL;
  ELSIF last_date = NEW.log_date - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE streaks SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_log_date = NEW.log_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken
    UPDATE streaks SET
      current_streak = 1,
      last_log_date = NEW.log_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak updates
DROP TRIGGER IF EXISTS trg_update_streak ON carbon_logs;
CREATE TRIGGER trg_update_streak
  AFTER INSERT ON carbon_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_streak();

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(user_xp integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(user_xp::numeric / 100))::integer + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine eco class from level
CREATE OR REPLACE FUNCTION get_eco_class(user_level integer)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN user_level >= 50 THEN 'Earth Protector'
    WHEN user_level >= 40 THEN 'Forest Guardian'
    WHEN user_level >= 30 THEN 'Tree'
    WHEN user_level >= 20 THEN 'Sapling'
    WHEN user_level >= 10 THEN 'Sprout'
    ELSE 'Seedling'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user stats after log
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_saved numeric;
  new_xp integer;
  new_level integer;
  new_class text;
BEGIN
  -- Calculate total carbon saved (simplified: baseline - actual)
  -- In production, this would compare against a user baseline
  SELECT COALESCE(SUM(carbon_kg), 0)
  INTO total_saved
  FROM carbon_logs
  WHERE user_id = NEW.user_id;

  -- Award XP: 10 XP per kg saved (simplified)
  new_xp := GREATEST(1, FLOOR(total_saved * 10)::integer);
  new_level := calculate_level(new_xp);
  new_class := get_eco_class(new_level);

  UPDATE profiles SET
    total_carbon_saved = total_saved,
    xp = new_xp,
    level = new_level,
    eco_class = new_class,
    avatar_stage = LEAST(6, 1 + FLOOR(new_level / 10)::integer),
    eco_score = LEAST(100, GREATEST(0, 100 - FLOOR(total_saved / 10)::integer)),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user stats
DROP TRIGGER IF EXISTS trg_update_stats ON carbon_logs;
CREATE TRIGGER trg_update_stats
  AFTER INSERT ON carbon_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Function: get carbon heatmap data
CREATE OR REPLACE FUNCTION get_carbon_heatmap(p_user_id uuid, p_year integer)
RETURNS TABLE (
  log_date date,
  total_carbon numeric,
  intensity text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.log_date,
    COALESCE(SUM(cl.carbon_kg), 0)::numeric AS total_carbon,
    CASE
      WHEN COALESCE(SUM(cl.carbon_kg), 0) < 5 THEN 'low'
      WHEN COALESCE(SUM(cl.carbon_kg), 0) < 15 THEN 'medium'
      ELSE 'high'
    END AS intensity
  FROM carbon_logs cl
  WHERE cl.user_id = p_user_id
    AND EXTRACT(YEAR FROM cl.log_date) = p_year
  GROUP BY cl.log_date
  ORDER BY cl.log_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get category breakdown
CREATE OR REPLACE FUNCTION get_category_breakdown(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  category_name text,
  display_name text,
  total_carbon numeric,
  log_count bigint,
  percentage numeric,
  color text
) AS $$
DECLARE
  total_all numeric;
BEGIN
  SELECT COALESCE(SUM(cl.carbon_kg), 0)
  INTO total_all
  FROM carbon_logs cl
  WHERE cl.user_id = p_user_id
    AND cl.log_date BETWEEN p_start_date AND p_end_date;

  RETURN QUERY
  SELECT
    c.name AS category_name,
    c.display_name,
    COALESCE(SUM(cl.carbon_kg), 0)::numeric AS total_carbon,
    COUNT(cl.id) AS log_count,
    CASE WHEN total_all > 0 THEN ROUND((COALESCE(SUM(cl.carbon_kg), 0) / total_all) * 100, 2) ELSE 0 END AS percentage,
    c.color
  FROM categories c
  LEFT JOIN carbon_logs cl ON cl.category_id = c.id
    AND cl.user_id = p_user_id
    AND cl.log_date BETWEEN p_start_date AND p_end_date
  GROUP BY c.id, c.name, c.display_name, c.color
  ORDER BY total_carbon DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(p_user_id uuid, p_year integer)
RETURNS TABLE (
  month integer,
  month_name text,
  total_carbon numeric,
  avg_daily numeric,
  trend text
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT
      EXTRACT(MONTH FROM cl.log_date)::integer AS m,
      SUM(cl.carbon_kg) AS total,
      COUNT(DISTINCT cl.log_date) AS days_logged
    FROM carbon_logs cl
    WHERE cl.user_id = p_user_id
      AND EXTRACT(YEAR FROM cl.log_date) = p_year
    GROUP BY EXTRACT(MONTH FROM cl.log_date)
  )
  SELECT
    md.m AS month,
    TO_CHAR(TO_DATE(md.m::text, 'MM'), 'Month') AS month_name,
    md.total::numeric AS total_carbon,
    ROUND(md.total / NULLIF(md.days_logged, 0), 2)::numeric AS avg_daily,
    'stable'::text AS trend
  FROM monthly_data md
  ORDER BY md.m;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
