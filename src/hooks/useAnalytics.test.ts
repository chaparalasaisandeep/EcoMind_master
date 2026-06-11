/**
 * EcoMind AI Ultra — Analytics Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  analyticsService: {
    getHeatmap: vi.fn(),
    getCategoryBreakdown: vi.fn(),
    getMonthlySummary: vi.fn(),
  },
  carbonLogService: {
    getByUserId: vi.fn(),
  },
}));

import { useAuth } from '../context/AuthContext';
import { analyticsService, carbonLogService } from '../services/api';
import { useAnalytics } from './useAnalytics';

const mockUseAuth = vi.mocked(useAuth);

const mockHeatmap = [
  { log_date: '2024-06-10', total_carbon: 12, intensity: 'medium' as const },
  { log_date: '2024-06-09', total_carbon: 3, intensity: 'low' as const },
];
const mockCategoryBreakdown = [
  { category_name: 'transport', display_name: 'Transport', total_carbon: 60, log_count: 10, percentage: 50, color: '#3b82f6' },
];
const mockMonthlySummary = [
  { month: 6, month_name: 'June', total_carbon: 180, avg_daily: 6, trend: 'improving' },
];

describe('useAnalytics', () => {
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

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.heatmap).toEqual([]);
      expect(result.current.categoryBreakdown).toEqual([]);
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

      vi.mocked(analyticsService.getHeatmap).mockResolvedValue(mockHeatmap as any);
      vi.mocked(analyticsService.getCategoryBreakdown).mockResolvedValue(mockCategoryBreakdown as any);
      vi.mocked(analyticsService.getMonthlySummary).mockResolvedValue(mockMonthlySummary as any);
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue([]);
    });

    it('should fetch all analytics data', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.heatmap).toEqual(mockHeatmap);
      expect(result.current.categoryBreakdown).toEqual(mockCategoryBreakdown);
      expect(result.current.monthlySummary).toEqual(mockMonthlySummary);
    });

    it('should call correct RPC methods', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(analyticsService.getHeatmap).toHaveBeenCalled();
      expect(analyticsService.getCategoryBreakdown).toHaveBeenCalled();
      expect(analyticsService.getMonthlySummary).toHaveBeenCalled();
    });

    it('should handle heatmap RPC error', async () => {
      vi.mocked(analyticsService.getHeatmap).mockRejectedValue(new Error('RPC error'));

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('RPC error');
    });

    it('should handle category breakdown RPC error', async () => {
      vi.mocked(analyticsService.getCategoryBreakdown).mockRejectedValue(new Error('Breakdown error'));

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should compute daily stats from carbon logs', async () => {
      const todayLogs = [
        { id: 'l1', user_id: 'user-1', category_id: 'cat-1', activity_name: 'Drive', quantity: 25, unit: 'km', emission_factor: 0.12, carbon_kg: 3, notes: null, log_date: new Date().toISOString().split('T')[0], created_at: '' },
      ];
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue(todayLogs as any);

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.dailyStats).not.toBeNull();
      expect(result.current.dailyStats?.totalCarbon).toBe(3);
    });

    it('should refetch analytics', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialCallCount = vi.mocked(analyticsService.getHeatmap).mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(vi.mocked(analyticsService.getHeatmap).mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should handle null daily stats when no logs', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue([]);

      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.dailyStats).not.toBeNull();
      expect(result.current.dailyStats?.totalCarbon).toBe(0);
    });
  });
});
