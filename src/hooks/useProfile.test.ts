/**
 * EcoMind AI Ultra — Profile Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  profileService: {
    getByUserId: vi.fn(),
    update: vi.fn(),
  },
}));

import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { useProfile } from './useProfile';

const mockUseAuth = vi.mocked(useAuth);

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('no user', () => {
    it('should set profile to null when no user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.profile).toBeNull();
    });
  });

  describe('with user', () => {
    const mockUser = { id: 'user-123' } as any;

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

    it('should fetch profile successfully', async () => {
      const mockProfile = { id: 'p1', user_id: 'user-123', display_name: 'Test User', eco_score: 75 };
      vi.mocked(profileService.getByUserId).mockResolvedValue(mockProfile as any);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      vi.mocked(profileService.getByUserId).mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('DB error');
    });

    it('should update profile successfully', async () => {
      const mockProfile = { id: 'p1', user_id: 'user-123', display_name: 'Test' };
      vi.mocked(profileService.getByUserId).mockResolvedValue(mockProfile as any);
      vi.mocked(profileService.update).mockResolvedValue(undefined);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updateResult: { error: Error | null } = { error: new Error('not called') };
      await act(async () => {
        updateResult = await result.current.updateProfile({ display_name: 'Updated' });
      });

      expect(profileService.update).toHaveBeenCalledWith('user-123', { display_name: 'Updated' });
      expect(updateResult.error).toBeNull();
    });

    it('should return error when updating without user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let updateResult: { error: Error | null } | undefined;
      await act(async () => {
        updateResult = await result.current.updateProfile({ display_name: 'test' });
      });

      expect(updateResult?.error).toBeInstanceOf(Error);
    });

    it('should handle update error', async () => {
      const mockProfile = { id: 'p1', user_id: 'user-123' };
      vi.mocked(profileService.getByUserId).mockResolvedValue(mockProfile as any);
      vi.mocked(profileService.update).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let updateResult: { error: Error | null } = { error: null };
      await act(async () => {
        updateResult = await result.current.updateProfile({ display_name: 'Updated' });
      });

      expect(updateResult.error).toBeInstanceOf(Error);
      expect(updateResult.error?.message).toBe('Update failed');
    });

    it('should refetch profile', async () => {
      vi.mocked(profileService.getByUserId).mockResolvedValue({ id: 'p1' } as any);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.refetch();
      });

      expect(profileService.getByUserId).toHaveBeenCalledTimes(2);
    });
  });
});
