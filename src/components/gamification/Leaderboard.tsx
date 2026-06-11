/**
 * EcoMind AI Ultra — Leaderboard
 * Competitive ranking with weekly and monthly views.
 */

import { useGamification } from '../../hooks/useGamification';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, Award } from 'lucide-react';
import { memo } from 'react';

const rankIcons = [Trophy, Medal, Award];
const rankColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

export function Leaderboard() {
  const { leaderboard } = useGamification();
  const { user } = useAuth();

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Carbon savings leaderboard">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No leaderboard data yet. Start logging to compete!</p>
      ) : (
        <ol className="space-y-2" role="list" aria-label="Top 10 users by carbon saved">
          {leaderboard.slice(0, 10).map((entry, index) => {
            const RankIcon = rankIcons[index] || Award;
            const isCurrentUser = entry.user_id === user?.id;

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  isCurrentUser ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-slate-800/30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < 3 ? 'bg-amber-500/20' : 'bg-slate-800/50'
                  }`}
                  aria-label={`Rank ${index + 1}`}
                >
                  {index < 3 ? (
                    <RankIcon className={`w-4 h-4 ${rankColors[index]}`} aria-hidden="true" />
                  ) : (
                    <span className="text-sm text-slate-400">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                    {isCurrentUser ? 'You' : `User ${entry.user_id.slice(0, 8)}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-white" aria-label={`${entry.carbon_saved_kg.toFixed(1)} kilograms CO2 equivalent saved`}>
                    {entry.carbon_saved_kg.toFixed(1)} kg CO2e
                  </p>
                  <p className="text-xs text-slate-500">saved</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default memo(Leaderboard);
