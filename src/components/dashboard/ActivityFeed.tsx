/**
 * EcoMind AI Ultra — Activity Feed
 * Timeline of recent carbon logs with AI recommendations.
 */

import { useCarbonLogs } from '../../hooks/useCarbonLogs';
import { Footprints, Trash2, Leaf, Zap, Car, Apple, ShoppingBag, Plane } from 'lucide-react';
import { useCallback, memo } from 'react';

const categoryIcons: Record<string, React.ElementType> = {
  transport: Car,
  energy: Zap,
  food: Apple,
  shopping: ShoppingBag,
  travel: Plane,
};

export function ActivityFeed() {
  const { logs, deleteLog } = useCarbonLogs();

  const recentLogs = logs.slice(0, 10);

  const handleDeleteLog = useCallback((id: string, activityName: string) => {
    deleteLog(id);
  }, [deleteLog]);

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label="Recent carbon logging activity feed">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>

      {recentLogs.length === 0 ? (
        <div className="text-center py-8">
          <Footprints className="w-12 h-12 text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-400">No activities logged yet.</p>
          <p className="text-sm text-slate-500 mt-1">Start logging your carbon footprint!</p>
        </div>
      ) : (
        <article className="space-y-3" role="feed" aria-label="List of recently logged carbon activities">
          {recentLogs.map((log) => {
            const Icon = categoryIcons[log.activity_name.toLowerCase().split(' ')[0]] || Leaf;
            return (
              <article
                key={log.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group"
                aria-label={`${log.activity_name}: ${log.quantity} ${log.unit}, ${log.carbon_kg.toFixed(2)} kg CO2e on ${log.log_date}`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{log.activity_name}</p>
                  <p className="text-xs text-slate-400">
                    {log.quantity} {log.unit} · {log.carbon_kg.toFixed(2)} kg CO2e · <time dateTime={log.log_date}>{log.log_date}</time>
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteLog(log.id, log.activity_name)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label={`Delete log: ${log.activity_name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </article>
      )}
    </section>
  );
}

export default memo(ActivityFeed);
