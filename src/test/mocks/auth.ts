import { vi } from 'vitest';
import type { User, Session } from '@supabase/supabase-js';

export const mockUser: User = {
  id: 'test-user-id-1234',
  app_metadata: {},
  user_metadata: { display_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  email: 'test@ecomind.ai',
} as unknown as User;

export const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  user: mockUser,
} as unknown as Session;

export const mockAuthContext = {
  user: mockUser,
  session: mockSession,
  isLoading: false,
  isAuthenticated: true,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
};

export const mockUnauthContext = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
};
