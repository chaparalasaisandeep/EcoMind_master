/**
 * EcoMind AI Ultra — Digital Twin Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  digitalTwinService: {
    getScenarios: vi.fn(),
    saveScenario: vi.fn(),
  },
  edgeFunctionService: {
    callDigitalTwin: vi.fn(),
  },
}));

import { useAuth } from '../context/AuthContext';
import { digitalTwinService, edgeFunctionService } from '../services/api';
import { useDigitalTwin } from './useDigitalTwin';

const mockUseAuth = vi.mocked(useAuth);

const mockScenario = {
  id: 'sc-1',
  user_id: 'user-1',
  scenario_name: 'Public Transport Scenario',
  scenario_type: 'public_transport' as const,
  parameters: {},
  projected_carbon_kg: 180,
  projected_savings_kg: 42,
  projected_money_saved: 6.3,
  success_probability: 0.85,
  environmental_impact: 'Equivalent to planting 2 trees per month',
  created_at: '2024-06-10',
};

describe('useDigitalTwin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with empty scenarios', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useDigitalTwin());
      expect(result.current.scenarios).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchScenarios', () => {
    it('should not fetch when user is null', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useDigitalTwin());

      await act(async () => {
        await result.current.fetchScenarios();
      });

      expect(digitalTwinService.getScenarios).not.toHaveBeenCalled();
    });

    it('should fetch scenarios successfully', async () => {
      const mockUser = { id: 'user-1' } as any;
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });
      vi.mocked(digitalTwinService.getScenarios).mockResolvedValue([mockScenario] as any);

      const { result } = renderHook(() => useDigitalTwin());

      await act(async () => {
        await result.current.fetchScenarios();
      });

      expect(result.current.scenarios).toEqual([mockScenario]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const mockUser = { id: 'user-1' } as any;
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });
      vi.mocked(digitalTwinService.getScenarios).mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useDigitalTwin());

      await act(async () => {
        await result.current.fetchScenarios();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Database error');
    });
  });

  describe('generateScenario', () => {
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

    it('should return error when unauthenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useDigitalTwin());

      let genResult: { error: Error | null; data: null } = { error: null, data: null };
      await act(async () => {
        genResult = await result.current.generateScenario('public_transport', {});
      });

      expect(genResult.error).toBeInstanceOf(Error);
    });

    it('should generate scenario successfully', async () => {
      const apiResult = {
        scenarioName: 'Public Transport Scenario',
        projectedCarbonKg: 180,
        projectedSavingsKg: 42,
        projectedMoneySaved: 6.3,
        carbonReductionPercent: 11.7,
        sustainabilityScore: 56,
        successProbability: 0.85,
        categoryImpacts: {},
        environmentalImpact: 'Equivalent to planting 2 trees',
      };

      vi.mocked(edgeFunctionService.callDigitalTwin).mockResolvedValue(apiResult as any);
      vi.mocked(digitalTwinService.saveScenario).mockResolvedValue(mockScenario as any);
      vi.mocked(digitalTwinService.getScenarios).mockResolvedValue([mockScenario] as any);

      const { result } = renderHook(() => useDigitalTwin());

      let genResult: { error: Error | null; data: any } = { error: null, data: null };
      await act(async () => {
        genResult = await result.current.generateScenario('public_transport', { transport: 30 });
      });

      expect(edgeFunctionService.callDigitalTwin).toHaveBeenCalledWith('user-1', 'public_transport', { transport: 30 });
      expect(digitalTwinService.saveScenario).toHaveBeenCalled();
      expect(genResult.error).toBeNull();
      expect(genResult.data).toEqual(mockScenario);
    });

    it('should handle API error', async () => {
      vi.mocked(edgeFunctionService.callDigitalTwin).mockRejectedValue(new Error('API error: 500'));

      const { result } = renderHook(() => useDigitalTwin());

      let genResult: { error: Error | null; data: any } = { error: null, data: null };
      await act(async () => {
        genResult = await result.current.generateScenario('public_transport', {});
      });

      expect(genResult.error).toBeInstanceOf(Error);
      expect(genResult.error?.message).toBe('API error: 500');
    });

    it('should handle database save error', async () => {
      const apiResult = {
        scenarioName: 'Test',
        projectedCarbonKg: 200,
        projectedSavingsKg: 20,
        projectedMoneySaved: 3,
        carbonReductionPercent: 10,
        sustainabilityScore: 55,
        successProbability: 0.8,
        categoryImpacts: {},
        environmentalImpact: 'test',
      };
      vi.mocked(edgeFunctionService.callDigitalTwin).mockResolvedValue(apiResult as any);
      vi.mocked(digitalTwinService.saveScenario).mockRejectedValue(new Error('DB save failed'));

      const { result } = renderHook(() => useDigitalTwin());

      let genResult: { error: Error | null; data: any } = { error: null, data: null };
      await act(async () => {
        genResult = await result.current.generateScenario('public_transport', {});
      });

      expect(genResult.error).toBeInstanceOf(Error);
      expect(genResult.error?.message).toBe('DB save failed');
    });

    it('should manage loading state during generation', async () => {
      let resolveApi: (value: any) => void = () => {};
      const apiPromise = new Promise((resolve) => { resolveApi = resolve; });
      vi.mocked(edgeFunctionService.callDigitalTwin).mockReturnValue(apiPromise as any);

      const { result } = renderHook(() => useDigitalTwin());

      act(() => {
        result.current.generateScenario('public_transport', {});
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the API call
      await act(async () => {
        resolveApi({
          scenarioName: 'Test',
          projectedCarbonKg: 200,
          projectedSavingsKg: 20,
          projectedMoneySaved: 3,
          carbonReductionPercent: 10,
          sustainabilityScore: 55,
          successProbability: 0.8,
          categoryImpacts: {},
          environmentalImpact: 'test',
        });
      });

      // Need to resolve saveScenario too
      vi.mocked(digitalTwinService.saveScenario).mockResolvedValue(mockScenario as any);
      vi.mocked(digitalTwinService.getScenarios).mockResolvedValue([mockScenario] as any);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
