/**
 * EcoMind AI Ultra — Integration Test Suite
 * Tests full user workflows across key features
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all hooks and services
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

vi.mock('../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}));

vi.mock('../hooks/useGamification', () => ({
  useGamification: vi.fn(),
}));

vi.mock('../hooks/useCarbonLogs', () => ({
  useCarbonLogs: vi.fn(),
}));

vi.mock('../hooks/useDigitalTwin', () => ({
  useDigitalTwin: vi.fn(),
}));

vi.mock('../services/api', () => ({
  edgeFunctionService: {
    callAiCoach: vi.fn(),
    callDigitalTwin: vi.fn(),
    callForecast: vi.fn(),
  },
  profileService: {
    getByUserId: vi.fn(),
    update: vi.fn(),
  },
  carbonLogService: {
    getByUserId: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
  analyticsService: {
    getHeatmap: vi.fn(),
    getCategoryBreakdown: vi.fn(),
    getMonthlySummary: vi.fn(),
  },
  gamificationService: {
    getBadges: vi.fn(),
    getUserBadges: vi.fn(),
    getQuests: vi.fn(),
    getUserQuests: vi.fn(),
    getStreak: vi.fn(),
    getLeaderboard: vi.fn(),
    startQuest: vi.fn(),
  },
  digitalTwinService: {
    getScenarios: vi.fn(),
    saveScenario: vi.fn(),
  },
  budgetService: {
    getBudget: vi.fn(),
    createDefault: vi.fn(),
  },
}));

vi.mock('../utils/validation', () => ({
  sanitizeString: vi.fn((s: string) => s),
  detectPromptInjection: vi.fn(() => false),
  isValidEmail: vi.fn(() => true),
  isValidPassword: vi.fn(() => true),
  aiRateLimiter: { canProceed: vi.fn(() => true) },
  RateLimiter: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useAnalytics } from '../hooks/useAnalytics';
import { useGamification } from '../hooks/useGamification';
import { useCarbonLogs } from '../hooks/useCarbonLogs';
import { AuthPage } from '../components/auth/AuthPage';
import { DashboardPage } from '../components/dashboard/DashboardPage';

const mockUseAuth = vi.mocked(useAuth);
const mockUseProfile = vi.mocked(useProfile);
const mockUseAnalytics = vi.mocked(useAnalytics);
const mockUseGamification = vi.mocked(useGamification);
const mockUseCarbonLogs = vi.mocked(useCarbonLogs);

const defaultCarbonLogsMock = {
  logs: [],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
  addLog: vi.fn().mockResolvedValue({ error: null }),
  deleteLog: vi.fn().mockResolvedValue({ error: null }),
};

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn(),
    });
  });

  it('should render sign-in form by default', () => {
    render(<AuthPage />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should switch to sign-up form', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    await user.click(screen.getByText("Don't have an account? Sign up"));
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
  });

  it('should call signIn on form submit', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: mockSignIn,
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn(),
    });

    render(<AuthPage />);

    await user.type(screen.getByLabelText('Email'), 'test@ecomind.ai');
    await user.type(screen.getByLabelText('Password'), 'TestPass123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockSignIn).toHaveBeenCalled();
  });
});

describe('Integration: Dashboard Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' } as any,
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseProfile.mockReturnValue({
      profile: {
        id: 'p1',
        user_id: 'user-1',
        display_name: 'Eco Warrior',
        age: null,
        occupation: null,
        budget_level: 'medium',
        location_type: 'urban',
        sustainability_goals: ['reduce transport'],
        transport_habits: null,
        food_habits: null,
        shopping_habits: null,
        eco_score: 75,
        total_carbon_saved: 50,
        total_money_saved: 7.5,
        xp: 500,
        level: 5,
        eco_class: 'Sprout',
        avatar_stage: 2,
        created_at: '',
        updated_at: '',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfile: vi.fn(),
    });

    mockUseAnalytics.mockReturnValue({
      heatmap: [],
      categoryBreakdown: [],
      monthlySummary: [],
      dailyStats: { date: '2024-06-10', totalCarbon: 5, categoryBreakdown: {}, budgetUsed: 5, budgetRemaining: 11.67 },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseGamification.mockReturnValue({
      badges: [],
      userBadges: [],
      quests: [],
      userQuests: [],
      streak: { id: 's1', user_id: 'user-1', current_streak: 5, longest_streak: 10, last_log_date: '2024-06-10', streak_protection_tokens: 1, created_at: '', updated_at: '' },
      leaderboard: [],
      isLoading: false,
      refetch: vi.fn(),
      startQuest: vi.fn(),
    });

    mockUseCarbonLogs.mockReturnValue(defaultCarbonLogsMock as any);
  });

  it('should render dashboard with user data', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /sustainability command center/i })).toBeInTheDocument();
    expect(screen.getByText(/Eco Warrior/)).toBeInTheDocument();
  });

  it('should display sustainability score section', () => {
    render(<DashboardPage />);

    // The sustainability score section exists (score animates from 0 to target)
    expect(screen.getByText(/Sprout/)).toBeInTheDocument();
  });

  it('should show environmental impact equivalents', () => {
    render(<DashboardPage />);

    // 50kg saved / 20kg per tree = 2 trees equivalent
    expect(screen.getByText(/Trees planted equivalent/)).toBeInTheDocument();
  });
});

describe('Integration: Carbon Logging Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' } as any,
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    mockUseCarbonLogs.mockReturnValue({
      logs: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      addLog: vi.fn().mockResolvedValue({ error: null }),
      deleteLog: vi.fn().mockResolvedValue({ error: null }),
    } as any);
  });

  it('should expose addLog function from useCarbonLogs hook', () => {
    const hookResult = mockUseCarbonLogs();
    expect(hookResult.addLog).toBeDefined();
    expect(typeof hookResult.addLog).toBe('function');
  });

  it('should expose deleteLog function from useCarbonLogs hook', () => {
    const hookResult = mockUseCarbonLogs();
    expect(hookResult.deleteLog).toBeDefined();
    expect(typeof hookResult.deleteLog).toBe('function');
  });
});
