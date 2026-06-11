/**
 * EcoMind AI Ultra — Gamification Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  gamificationService: {
    getBadges: vi.fn(),
    getUserBadges: vi.fn(),
    getQuests: vi.fn(),
    getUserQuests: vi.fn(),
    getStreak: vi.fn(),
    getLeaderboard: vi.fn(),
    startQuest: vi.fn(),
  },
}));

import { useAuth } from '../context/AuthContext';
import { gamificationService } from '../services/api';
import { useGamification } from './useGamification';

const mockUseAuth = vi.mocked(useAuth);

const mockBadges = [{ id: 'b1', name: 'First Log', display_name: 'First Log', description: 'Log your first activity', rarity: 'common', requirement_type: 'logs', requirement_value: 1, xp_reward: 50 }];
const mockUserBadges = [{ id: 'ub1', user_id: 'user-1', badge_id: 'b1', earned_at: '2024-01-01', badge: mockBadges[0] }];
const mockQuests = [{ id: 'q1', name: 'Meatless Week', display_name: 'Meatless Week', description: '7 days without meat', category: 'food', difficulty: 'medium', xp_reward: 200, eco_points_reward: 50, requirement_type: 'meatless_days', requirement_value: 7, duration_days: 7 }];
const mockUserQuests = [{ id: 'uq1', user_id: 'user-1', quest_id: 'q1', progress: 3, status: 'active', started_at: '2024-01-01', completed_at: null, quest: mockQuests[0] }];
const mockStreak = { id: 's1', user_id: 'user-1', current_streak: 5, longest_streak: 12, last_log_date: '2024-06-10', streak_protection_tokens: 2 };
const mockLeaderboard = [{ id: 'l1', user_id: 'user-1', period: 'weekly', carbon_saved_kg: 25, xp_earned: 250, quests_completed: 3, rank: 1 }];

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('no user', () => {
    it('should return empty data when no user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.badges).toEqual([]);
      expect(result.current.streak).toBeNull();
    });
  });

  describe('with user', () => {
    const mockUser = { id: 'user-1' } as any;

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(gamificationService.getBadges).mockResolvedValue(mockBadges as any);
      vi.mocked(gamificationService.getUserBadges).mockResolvedValue(mockUserBadges as any);
      vi.mocked(gamificationService.getQuests).mockResolvedValue(mockQuests as any);
      vi.mocked(gamificationService.getUserQuests).mockResolvedValue(mockUserQuests as any);
      vi.mocked(gamificationService.getStreak).mockResolvedValue(mockStreak as any);
      vi.mocked(gamificationService.getLeaderboard).mockResolvedValue(mockLeaderboard as any);
    });

    it('should fetch all gamification data in parallel', async () => {
      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.badges).toEqual(mockBadges);
      expect(result.current.userBadges).toEqual(mockUserBadges);
      expect(result.current.quests).toEqual(mockQuests);
      expect(result.current.userQuests).toEqual(mockUserQuests);
      expect(result.current.streak).toEqual(mockStreak);
      expect(result.current.leaderboard).toEqual(mockLeaderboard);
    });

    it('should call all service methods with correct user id', async () => {
      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(gamificationService.getUserBadges).toHaveBeenCalledWith('user-1');
      expect(gamificationService.getUserQuests).toHaveBeenCalledWith('user-1');
      expect(gamificationService.getStreak).toHaveBeenCalledWith('user-1');
    });

    it('should handle partial fetch failures gracefully', async () => {
      vi.mocked(gamificationService.getBadges).mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      // Other data may still be empty since Promise.all fails fast
      expect(result.current.isLoading).toBe(false);
    });

    it('should start quest successfully', async () => {
      vi.mocked(gamificationService.startQuest).mockResolvedValue(undefined);

      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let startResult: { error: Error | null } = { error: new Error('not called') };
      await act(async () => {
        startResult = await result.current.startQuest('q1');
      });

      expect(gamificationService.startQuest).toHaveBeenCalledWith('user-1', 'q1');
      expect(startResult.error).toBeNull();
    });

    it('should return error when starting quest without user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let startResult: { error: Error | null } | undefined;
      await act(async () => {
        startResult = await result.current.startQuest('q1');
      });

      expect(startResult?.error).toBeInstanceOf(Error);
    });

    it('should handle start quest error', async () => {
      vi.mocked(gamificationService.startQuest).mockRejectedValue(new Error('Quest start failed'));

      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let startResult: { error: Error | null } = { error: null };
      await act(async () => {
        startResult = await result.current.startQuest('q1');
      });

      expect(startResult.error).toBeInstanceOf(Error);
      expect(startResult.error?.message).toBe('Quest start failed');
    });

    it('should refetch gamification data', async () => {
      const { result } = renderHook(() => useGamification());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialCallCount = vi.mocked(gamificationService.getBadges).mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(vi.mocked(gamificationService.getBadges).mock.calls.length).toBe(initialCallCount + 1);
    });
  });
});
