/**
 * EcoMind AI Ultra — Authentication Context
 * Secure auth state management with session persistence.
 * Security: Validates auth state, handles token refresh, protects routes.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { isValidEmail, isValidPassword, sanitizeString } from '../utils/validation';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email)) {
      return { error: new Error('Invalid email format') };
    }
    if (!isValidPassword(password)) {
      return { error: new Error('Invalid password format') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isValidEmail(email)) {
      return { error: new Error('Invalid email format') };
    }
    if (!isValidPassword(password)) {
      return { error: new Error('Password must be 8+ chars with uppercase, lowercase, and digit') };
    }

    const sanitizedDisplayName = sanitizeString(displayName);
    if (!sanitizedDisplayName || sanitizedDisplayName.length < 1) {
      return { error: new Error('Display name is required') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: sanitizedDisplayName },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data.user) {
      await Promise.all([
        supabase.from('profiles').insert({
          user_id: data.user.id,
          display_name: sanitizedDisplayName,
        }),
        supabase.from('carbon_budgets').insert({
          user_id: data.user.id,
          monthly_budget_kg: 500,
        }),
        supabase.from('streaks').insert({
          user_id: data.user.id,
        }),
      ]);
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
