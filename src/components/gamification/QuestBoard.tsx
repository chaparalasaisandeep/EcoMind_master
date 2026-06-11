/**
 * EcoMind AI Ultra — Quest Board
 * RPG-style sustainability quest system.
 */

import { useGamification } from '../../hooks/useGamification';
import { Sword, Clock, Trophy, Zap } from 'lucide-react';
import { memo } from 'react';

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  hard: 'text-red-400 bg-red-500/10',
  expert: 'text-purple-400 bg-purple-500/10',
};

export function QuestBoard() {
  const { quests, userQuests, startQuest, isLoading } = useGamification();

  const activeQuestIds = new Set(userQuests.map((uq) => uq.quest_id));

  const getQuestStatus = (questId: string) => {
    const userQuest = userQuests.find((uq) => uq.quest_id === questId);
    return userQuest?.status || 'available';
  };

  if (isLoading) {
    return (
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Quests loading">
        <h2 className="text-lg font-semibold text-white mb-4">Quest Board</h2>
        <p className="text-slate-400">Loading quests...</p>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Sustainability quests board">
      <div className="flex items-center gap-2 mb-4">
        <Sword className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">Quest Board</h2>
      </div>

      <div className="space-y-3" role="list" aria-label="Available and active quests">
        {quests.map((quest) => {
          const status = getQuestStatus(quest.id);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          return (
            <article
              key={quest.id}
              role="listitem"
              aria-label={`${quest.display_name} quest, ${status} status`}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isActive
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{quest.display_name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        difficultyColors[quest.difficulty || 'easy']
                      }`}
                      aria-label={`Difficulty: ${quest.difficulty}`}
                    >
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{quest.description}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1" aria-label={`Duration: ${quest.duration_days} days`}>
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {quest.duration_days} days
                    </span>
                    <span className="flex items-center gap-1" aria-label={`Experience reward: ${quest.xp_reward} XP`}>
                      <Zap className="w-3 h-3" aria-hidden="true" />
                      {quest.xp_reward} XP
                    </span>
                    <span className="flex items-center gap-1" aria-label={`Eco points reward: ${quest.eco_points_reward} points`}>
                      <Trophy className="w-3 h-3" aria-hidden="true" />
                      {quest.eco_points_reward} pts
                    </span>
                  </div>
                </div>

                {isCompleted ? (
                  <span className="text-emerald-400 text-sm font-medium" role="status">Completed</span>
                ) : isActive ? (
                  <div className="text-right">
                    <span className="text-amber-400 text-sm font-medium" role="status">In Progress</span>
                  </div>
                ) : (
                  <button
                    onClick={() => startQuest(quest.id)}
                    aria-label={`Start ${quest.display_name} quest`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Start Quest
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default memo(QuestBoard);
