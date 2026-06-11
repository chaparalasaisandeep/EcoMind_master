/**
 * EcoMind AI Ultra — Profile Hook
 * Fetches and manages user profile data with error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { fromSupabaseError, isErrorType, AuthenticationError, DatabaseError } from '../errors';
import type { Profile } from '../types';

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await profileService.getByUserId(user.id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: new AuthenticationError() as Error };

    try {
      await profileService.update(user.id, updates);
      await fetchProfile();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new DatabaseError('Failed to update profile');
      return { error };
    }
  }, [user, fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
}
