/**
 * EcoMind AI Ultra — Carbon Logs Hook
 * Manages carbon footprint logging with real-time calculation.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { carbonLogService } from '../services/api';
import { AuthenticationError, DatabaseError } from '../errors';
import type { CarbonLog, LogFormData } from '../types';

interface UseCarbonLogsReturn {
  logs: CarbonLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addLog: (formData: LogFormData) => Promise<{ error: Error | null }>;
  deleteLog: (logId: string) => Promise<{ error: Error | null }>;
}

export function useCarbonLogs(dateRange?: { start: string; end: string }): UseCarbonLogsReturn {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await carbonLogService.getByUserId(user.id, dateRange);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setIsLoading(false);
    }
  }, [user, dateRange?.start, dateRange?.end]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (formData: LogFormData) => {
    if (!user) return { error: new AuthenticationError() as Error };

    try {
      await carbonLogService.add(user.id, formData);
      await fetchLogs();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new DatabaseError('Failed to add log');
      return { error };
    }
  }, [user, fetchLogs]);

  const deleteLog = useCallback(async (logId: string) => {
    if (!user) return { error: new AuthenticationError() as Error };

    try {
      await carbonLogService.delete(user.id, logId);
      await fetchLogs();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new DatabaseError('Failed to delete log');
      return { error };
    }
  }, [user, fetchLogs]);

  return { logs, isLoading, error, refetch: fetchLogs, addLog, deleteLog };
}
