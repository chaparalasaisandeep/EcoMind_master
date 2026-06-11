/**
 * EcoMind AI Ultra — Database Schema Types
 * Generated types for Supabase type safety.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          age: number | null;
          occupation: string | null;
          budget_level: string | null;
          location_type: string | null;
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
        };
        Insert: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          age?: number | null;
          occupation?: string | null;
          budget_level?: string | null;
          location_type?: string | null;
          sustainability_goals?: string[] | null;
          transport_habits?: string | null;
          food_habits?: string | null;
          shopping_habits?: string | null;
          eco_score?: number;
          total_carbon_saved?: number;
          total_money_saved?: number;
          xp?: number;
          level?: number;
          eco_class?: string;
          avatar_stage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          age?: number | null;
          occupation?: string | null;
          budget_level?: string | null;
          location_type?: string | null;
          sustainability_goals?: string[] | null;
          transport_habits?: string | null;
          food_habits?: string | null;
          shopping_habits?: string | null;
          eco_score?: number;
          total_carbon_saved?: number;
          total_money_saved?: number;
          xp?: number;
          level?: number;
          eco_class?: string;
          avatar_stage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          icon_name: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          icon_name?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          icon_name?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      emission_factors: {
        Row: {
          id: string;
          category_id: string;
          activity_name: string;
          unit: string;
          factor: number;
          source: string | null;
          region: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          activity_name: string;
          unit: string;
          factor: number;
          source?: string | null;
          region?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          activity_name?: string;
          unit?: string;
          factor?: number;
          source?: string | null;
          region?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      carbon_logs: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          activity_name: string;
          quantity: number;
          unit: string;
          emission_factor: number;
          carbon_kg: number;
          notes?: string | null;
          log_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          activity_name?: string;
          quantity?: number;
          unit?: string;
          emission_factor?: number;
          carbon_kg?: number;
          notes?: string | null;
          log_date?: string;
          created_at?: string;
        };
      };
      carbon_budgets: {
        Row: {
          id: string;
          user_id: string;
          monthly_budget_kg: number;
          daily_budget_kg: number;
          warning_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          monthly_budget_kg?: number;
          warning_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_budget_kg?: number;
          warning_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_log_date: string | null;
          streak_protection_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_log_date?: string | null;
          streak_protection_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_log_date?: string | null;
          streak_protection_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string;
          icon_name: string | null;
          rarity: string;
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description: string;
          icon_name?: string | null;
          rarity?: string;
          requirement_type: string;
          requirement_value: number;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string;
          icon_name?: string | null;
          rarity?: string;
          requirement_type?: string;
          requirement_value?: number;
          xp_reward?: number;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string;
          category: string | null;
          difficulty: string | null;
          xp_reward: number;
          eco_points_reward: number;
          requirement_type: string;
          requirement_value: number;
          duration_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description: string;
          category?: string | null;
          difficulty?: string | null;
          xp_reward?: number;
          eco_points_reward?: number;
          requirement_type: string;
          requirement_value: number;
          duration_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string;
          category?: string | null;
          difficulty?: string | null;
          xp_reward?: number;
          eco_points_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
          duration_days?: number;
          created_at?: string;
        };
      };
      user_quests: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          progress: number;
          status: string;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          quest_id: string;
          progress?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          quest_id?: string;
          progress?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      ai_coach_sessions: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          role: string;
          context: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          message: string;
          role: string;
          context?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          role?: string;
          context?: Record<string, unknown>;
          created_at?: string;
        };
      };
      carbon_forecasts: {
        Row: {
          id: string;
          user_id: string;
          forecast_date: string;
          predicted_carbon_kg: number;
          confidence: number;
          category_breakdown: Record<string, number>;
          trend_direction: string | null;
          ai_reasoning: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          forecast_date: string;
          predicted_carbon_kg: number;
          confidence: number;
          category_breakdown?: Record<string, number>;
          trend_direction?: string | null;
          ai_reasoning?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          forecast_date?: string;
          predicted_carbon_kg?: number;
          confidence?: number;
          category_breakdown?: Record<string, number>;
          trend_direction?: string | null;
          ai_reasoning?: string | null;
          created_at?: string;
        };
      };
      digital_twin_scenarios: {
        Row: {
          id: string;
          user_id: string;
          scenario_name: string;
          scenario_type: string;
          parameters: Record<string, unknown>;
          projected_carbon_kg: number | null;
          projected_savings_kg: number | null;
          projected_money_saved: number | null;
          success_probability: number | null;
          environmental_impact: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          scenario_name: string;
          scenario_type: string;
          parameters?: Record<string, unknown>;
          projected_carbon_kg?: number | null;
          projected_savings_kg?: number | null;
          projected_money_saved?: number | null;
          success_probability?: number | null;
          environmental_impact?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scenario_name?: string;
          scenario_type?: string;
          parameters?: Record<string, unknown>;
          projected_carbon_kg?: number | null;
          projected_savings_kg?: number | null;
          projected_money_saved?: number | null;
          success_probability?: number | null;
          environmental_impact?: string | null;
          created_at?: string;
        };
      };
      leaderboard_entries: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          carbon_saved_kg: number;
          xp_earned: number;
          quests_completed: number;
          rank: number | null;
          period_start: string;
          period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          period: string;
          carbon_saved_kg?: number;
          xp_earned?: number;
          quests_completed?: number;
          rank?: number | null;
          period_start: string;
          period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period?: string;
          carbon_saved_kg?: number;
          xp_earned?: number;
          quests_completed?: number;
          rank?: number | null;
          period_start?: string;
          period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
