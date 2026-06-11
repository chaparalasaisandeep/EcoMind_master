/**
 * EcoMind AI Ultra — Carbon Logs Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  carbonLogService: {
    getByUserId: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useAuth } from '../context/AuthContext';
import { carbonLogService } from '../services/api';
import { useCarbonLogs } from './useCarbonLogs';

const mockUseAuth = vi.mocked(useAuth);

const mockLogs = [
  { id: 'log-1', user_id: 'user-1', category_id: 'cat-1', activity_name: 'Drive to work', quantity: 25, unit: 'km', emission_factor: 0.12, carbon_kg: 3, notes: 'Daily commute', log_date: '2024-06-10' },
  { id: 'log-2', user_id: 'user-1', category_id: 'cat-1', activity_name: 'Weekend trip', quantity: 100, unit: 'km', emission_factor: 0.12, carbon_kg: 12, notes: 'Family visit', log_date: '2024-06-09' },
];

describe('useCarbonLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('no user', () => {
    it('should return empty logs when no user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.logs).toEqual([]);
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
    });

    it('should fetch logs successfully', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue(mockLogs as any);

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.logs).toEqual(mockLogs);
    });

    it('should fetch logs with date range', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue(mockLogs as any);

      const dateRange = { start: '2024-06-01', end: '2024-06-30' };
      const { result } = renderHook(() => useCarbonLogs(dateRange));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(carbonLogService.getByUserId).toHaveBeenCalledWith('user-1', dateRange);
    });

    it('should handle fetch error', async () => {
      vi.mocked(carbonLogService.getByUserId).mockRejectedValue(new Error('Query failed'));

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Query failed');
    });

    it('should add log successfully', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue(mockLogs as any);
      vi.mocked(carbonLogService.add).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const formData = {
        categoryId: 'cat-1',
        activityName: 'Bus ride',
        quantity: 10,
        unit: 'km',
        notes: '',
        logDate: '2024-06-11',
      };

      let addResult: { error: Error | null } = { error: new Error('not called') };
      await act(async () => {
        addResult = await result.current.addLog(formData);
      });

      expect(carbonLogService.add).toHaveBeenCalledWith('user-1', formData);
      expect(addResult.error).toBeNull();
    });

    it('should return error when adding log without user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let addResult: { error: Error | null } | undefined;
      await act(async () => {
        addResult = await result.current.addLog({
          categoryId: 'cat-1',
          activityName: 'test',
          quantity: 1,
          unit: 'km',
          notes: '',
          logDate: '2024-01-01',
        });
      });

      expect(addResult?.error).toBeInstanceOf(Error);
    });

    it('should handle add log error', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue([]);
      vi.mocked(carbonLogService.add).mockRejectedValue(new Error('Insert failed'));

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let addResult: { error: Error | null } = { error: null };
      await act(async () => {
        addResult = await result.current.addLog({
          categoryId: 'cat-1',
          activityName: 'test',
          quantity: 1,
          unit: 'km',
          notes: '',
          logDate: '2024-01-01',
        });
      });

      expect(addResult.error).toBeInstanceOf(Error);
      expect(addResult.error?.message).toBe('Insert failed');
    });

    it('should delete log successfully', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue(mockLogs as any);
      vi.mocked(carbonLogService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let deleteResult: { error: Error | null } = { error: new Error('not called') };
      await act(async () => {
        deleteResult = await result.current.deleteLog('log-1');
      });

      expect(carbonLogService.delete).toHaveBeenCalledWith('user-1', 'log-1');
      expect(deleteResult.error).toBeNull();
    });

    it('should return error when deleting without user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let deleteResult: { error: Error | null } | undefined;
      await act(async () => {
        deleteResult = await result.current.deleteLog('log-1');
      });

      expect(deleteResult?.error).toBeInstanceOf(Error);
    });

    it('should handle delete log error', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue([]);
      vi.mocked(carbonLogService.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let deleteResult: { error: Error | null } = { error: null };
      await act(async () => {
        deleteResult = await result.current.deleteLog('log-1');
      });

      expect(deleteResult.error).toBeInstanceOf(Error);
      expect(deleteResult.error?.message).toBe('Delete failed');
    });

    it('should refetch logs', async () => {
      vi.mocked(carbonLogService.getByUserId).mockResolvedValue([]);

      const { result } = renderHook(() => useCarbonLogs());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.refetch();
      });

      expect(carbonLogService.getByUserId).toHaveBeenCalledTimes(2);
    });
  });
});
