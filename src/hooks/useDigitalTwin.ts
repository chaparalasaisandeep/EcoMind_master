/**
 * EcoMind AI Ultra — Digital Twin Hook
 * Manages AI-generated lifestyle scenario simulations.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { digitalTwinService, edgeFunctionService } from '../services/api';
import { AuthenticationError } from '../errors';
import type { DigitalTwinScenario } from '../types';

interface UseDigitalTwinReturn {
  scenarios: DigitalTwinScenario[];
  isLoading: boolean;
  error: Error | null;
  fetchScenarios: () => Promise<void>;
  generateScenario: (
    scenarioType: DigitalTwinScenario['scenario_type'],
    parameters: Record<string, unknown>
  ) => Promise<{ error: Error | null; data: DigitalTwinScenario | null }>;
}

export function useDigitalTwin(): UseDigitalTwinReturn {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<DigitalTwinScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchScenarios = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await digitalTwinService.getScenarios(user.id);
      setScenarios(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scenarios'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateScenario = useCallback(async (
    scenarioType: DigitalTwinScenario['scenario_type'],
    parameters: Record<string, unknown>
  ) => {
    if (!user) return { error: new AuthenticationError() as Error, data: null };

    setIsLoading(true);
    setError(null);

    try {
      const result = await edgeFunctionService.callDigitalTwin(
        user.id,
        scenarioType,
        parameters
      );

      const savedScenario = await digitalTwinService.saveScenario(
        user.id,
        result.scenarioName || `${scenarioType} Scenario`,
        scenarioType,
        parameters,
        result
      );

      await fetchScenarios();
      return { error: null, data: savedScenario };
    } catch (err) {
      const errObj = err instanceof Error ? err : new Error('Failed to generate scenario');
      setError(errObj);
      return { error: errObj, data: null };
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchScenarios]);

  return { scenarios, isLoading, error, fetchScenarios, generateScenario };
}
