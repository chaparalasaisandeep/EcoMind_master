/**
 * EcoMind AI Ultra — Streak Display
 * Duolingo-style streak visualization with flame animation.
 */

import { useGamification } from '../../hooks/useGamification';
import { Flame, Shield } from 'lucide-react';
import { memo } from 'react';

export function StreakDisplay() {
  const { streak } = useGamification();

  if (!streak) return null;

  const isLongStreak = streak.current_streak >= 7;

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Daily logging streak statistics">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isLongStreak ? 'bg-amber-500/20' : 'bg-slate-800/50'
            }`}
            role="img"
            aria-label={isLongStreak ? 'On fire, active streak' : 'Not on fire'}
          >
            <Flame className={`w-8 h-8 ${isLongStreak ? 'text-amber-400' : 'text-slate-500'}`} aria-hidden="true" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white" aria-label={`Current streak: ${streak.current_streak} days`}>
              {streak.current_streak}
            </p>
            <p className="text-sm text-slate-400">Day Streak</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">Longest Streak</p>
          <p className="text-xl font-bold text-white" aria-label={`All-time longest streak: ${streak.longest_streak} days`}>
            {streak.longest_streak} days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <div>
            <p className="text-sm text-slate-400">Protection Tokens</p>
            <p className="text-xl font-bold text-white" aria-label={`${streak.streak_protection_tokens} protection tokens available to use if you miss a day`}>
              {streak.streak_protection_tokens}
            </p>
          </div>
        </div>
      </div>

      {isLongStreak && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl" role="status" aria-live="polite">
          <p className="text-sm text-amber-300 text-center">
            You're on fire! {streak.current_streak} days of consistent logging. Keep it up!
          </p>
        </div>
      )}
    </section>
  );
}

export default memo(StreakDisplay);
