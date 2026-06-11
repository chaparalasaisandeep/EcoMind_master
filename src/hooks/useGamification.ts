/**
 * EcoMind AI Ultra — Gamification Hook
 * Manages badges, quests, streaks, and leaderboard data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { gamificationService } from '../services/api';
import { AuthenticationError, DatabaseError } from '../errors';
import type { Badge, UserBadge, Quest, UserQuest, Streak, LeaderboardEntry } from '../types';

interface UseGamificationReturn {
  badges: Badge[];
  userBadges: UserBadge[];
  quests: Quest[];
  userQuests: UserQuest[];
  streak: Streak | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  startQuest: (questId: string) => Promise<{ error: Error | null }>;
}

export function useGamification(): UseGamificationReturn {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGamificationData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [badgesData, userBadgesData, questsData, userQuestsData, streakData, leaderboardData] =
        await Promise.all([
          gamificationService.getBadges(),
          gamificationService.getUserBadges(user.id),
          gamificationService.getQuests(),
          gamificationService.getUserQuests(user.id),
          gamificationService.getStreak(user.id),
          gamificationService.getLeaderboard(),
        ]);

      setBadges(badgesData);
      setUserBadges(userBadgesData);
      setQuests(questsData);
      setUserQuests(userQuestsData);
      setStreak(streakData);
      setLeaderboard(leaderboardData);
    } catch {
      // Partial data is acceptable — already set to defaults
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const startQuest = useCallback(async (questId: string) => {
    if (!user) return { error: new AuthenticationError() as Error };

    try {
      await gamificationService.startQuest(user.id, questId);
      await fetchGamificationData();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new DatabaseError('Failed to start quest');
      return { error };
    }
  }, [user, fetchGamificationData]);

  return {
    badges,
    userBadges,
    quests,
    userQuests,
    streak,
    leaderboard,
    isLoading,
    refetch: fetchGamificationData,
    startQuest,
  };
}
