/**
 * EcoMind AI Ultra — Achievement Badge Wall
 * Steam-style achievement display with rarity levels.
 */

import { useGamification } from '../../hooks/useGamification';
import { Lock, Award, Star } from 'lucide-react';
import { memo } from 'react';

const rarityColors: Record<string, string> = {
  common: 'border-slate-600 bg-slate-800/50',
  uncommon: 'border-emerald-600 bg-emerald-900/20',
  rare: 'border-blue-600 bg-blue-900/20',
  epic: 'border-purple-600 bg-purple-900/20',
  legendary: 'border-amber-500 bg-amber-900/20',
};

const rarityTextColors: Record<string, string> = {
  common: 'text-slate-400',
  uncommon: 'text-emerald-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export function BadgeWall() {
  const { badges, userBadges, isLoading } = useGamification();

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  if (isLoading) {
    return (
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Achievements loading">
        <h2 className="text-lg font-semibold text-white mb-4">Achievement Wall</h2>
        <p className="text-slate-400">Loading badges...</p>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Achievement badges wall">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Achievement Wall</h2>
        <div className="flex items-center gap-1 text-sm text-slate-400" aria-label={`Achievements unlocked: ${userBadges.length} out of ${badges.length}`}>
          <Award className="w-4 h-4" aria-hidden="true" />
          <span>{userBadges.length} / {badges.length} unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="list">
        {badges.map((badge) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          const earnedBadge = userBadges.find((ub) => ub.badge_id === badge.id);

          return (
            <article
              key={badge.id}
              role="listitem"
              aria-label={`${badge.display_name} badge${isEarned ? ', earned' : ', locked'}`}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                isEarned
                  ? `${rarityColors[badge.rarity]} hover:scale-105`
                  : 'border-slate-800 bg-slate-800/20 opacity-50 grayscale'
              }`}
            >
              {!isEarned && (
                <div className="absolute top-2 right-2" aria-label="Badge locked">
                  <Lock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                </div>
              )}

              <div className="flex flex-col items-center text-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isEarned ? 'bg-emerald-500/20' : 'bg-slate-700/30'
                }`}>
                  <Star className={`w-6 h-6 ${isEarned ? 'text-emerald-400' : 'text-slate-600'}`} aria-hidden="true" />
                </div>

                <div>
                  <p className={`text-sm font-semibold ${isEarned ? rarityTextColors[badge.rarity] : 'text-slate-500'}`}>
                    {badge.display_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                </div>

                {isEarned && earnedBadge && (
                  <p className="text-[10px] text-slate-500">
                    Earned <time dateTime={earnedBadge.earned_at}>{new Date(earnedBadge.earned_at).toLocaleDateString()}</time>
                  </p>
                )}

                <span className={`text-[10px] uppercase tracking-wider font-bold ${
                  isEarned ? rarityTextColors[badge.rarity] : 'text-slate-600'
                }`} aria-label={`Rarity: ${badge.rarity}`}>
                  {badge.rarity}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default memo(BadgeWall);
