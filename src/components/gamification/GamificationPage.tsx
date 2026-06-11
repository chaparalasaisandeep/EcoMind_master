/**
 * EcoMind AI Ultra — Gamification Page
 * RPG-style sustainability progression hub.
 */

import { useProfile } from '../../hooks/useProfile';
import { useGamification } from '../../hooks/useGamification';
import { BadgeWall } from './BadgeWall';
import { QuestBoard } from './QuestBoard';
import { StreakDisplay } from './StreakDisplay';
import { Leaderboard } from './Leaderboard';
import { Loader2 } from 'lucide-react';

export function GamificationPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { isLoading: gamificationLoading } = useGamification();

  if (profileLoading || gamificationLoading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite" aria-label="Loading achievements">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" aria-hidden="true" />
        <span className="ml-3 text-slate-400">Loading your achievements...</span>
      </div>
    );
  }

  return (
    <main className="space-y-6" role="main">
      <header>
        <h1 className="text-2xl font-bold text-white">Your Sustainability Journey</h1>
        <p className="text-slate-400 mt-1">
          <span aria-label={`Current level: ${profile?.level || 1}, eco class: ${profile?.eco_class || 'Seedling'}, experience points: ${profile?.xp || 0}`}>
            Level {profile?.level || 1} · {profile?.eco_class || 'Seedling'} · {profile?.xp || 0} XP
          </span>
        </p>
      </header>

      <StreakDisplay />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BadgeWall />
        <QuestBoard />
      </div>

      <Leaderboard />
    </main>
  );
}
