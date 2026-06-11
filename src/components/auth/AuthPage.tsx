/**
 * EcoMind AI Ultra — Authentication Page
 * Secure sign-in and sign-up with validation.
 * Security: Password strength, input sanitization, error handling.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPassword, sanitizeString } from '../../utils/validation';
import { Leaf, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitizedEmail = sanitizeString(email).toLowerCase().trim();
    const sanitizedDisplayName = sanitizeString(displayName).trim();

    if (!isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    if (isSignUp && !sanitizedDisplayName) {
      setError('Please enter a display name.');
      return;
    }

    setIsLoading(true);

    const { error: authError } = isSignUp
      ? await signUp(sanitizedEmail, password, sanitizedDisplayName)
      : await signIn(sanitizedEmail, password);

    if (authError) {
      setError(authError.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">EcoMind AI Ultra</h1>
          <p className="text-slate-400 mt-1">Your AI-Powered Sustainability Operating System</p>
        </div>

        {/* Form */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm" role="alert">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Eco Warrior"
                  required={isSignUp}
                  maxLength={50}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
                required
                maxLength={254}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 8 characters with uppercase, lowercase, and number.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  {isSignUp ? 'Creating...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
