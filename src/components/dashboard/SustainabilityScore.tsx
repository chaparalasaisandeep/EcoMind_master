/**
 * EcoMind AI Ultra — Sustainability Score Card
 * Animated circular score display with tier ranking.
 */

import { useEffect, useState, useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SustainabilityScoreProps {
  score: number;
  previousScore?: number;
  ecoClass: string;
  avatarStage: number;
}

export function SustainabilityScore({ score, previousScore, ecoClass, avatarStage }: SustainabilityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const trend = previousScore !== undefined
    ? score > previousScore ? 'up' : score < previousScore ? 'down' : 'same'
    : 'same';

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return '#34d399';
    if (s >= 60) return '#fbbf24';
    if (s >= 40) return '#fb923c';
    return '#f87171';
  };

  const avatars = ['🌱', '🌿', '🌳', '🌲', '🛡️', '👑'];

  const scoreDescription = useMemo(() => {
    if (animatedScore >= 80) return 'Excellent sustainability practices';
    if (animatedScore >= 60) return 'Good progress towards sustainability goals';
    if (animatedScore >= 40) return 'Moderate sustainability impact';
    return 'Opportunity for improvement';
  }, [animatedScore]);

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label={`Sustainability score: ${animatedScore} out of 100`}>
      <h2 className="text-lg font-semibold text-white mb-4">Sustainability Score</h2>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-label={`Score circle: ${animatedScore}%`}>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={getStrokeColor(animatedScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(animatedScore)}`} aria-label={`Score: ${animatedScore} out of 100`}>
              {animatedScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label={`Avatar: ${ecoClass}`}>
              {avatars[Math.min(avatarStage - 1, 5)]}
            </span>
            <div>
              <p className="text-white font-semibold">{ecoClass}</p>
              <p className="text-sm text-slate-400">Stage {avatarStage}</p>
            </div>
          </div>

          {trend !== 'same' && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs((previousScore ?? 0) - score)} points {trend === 'up' ? 'improvement' : 'decrease'}</span>
            </div>
          )}

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedScore}%`,
                backgroundColor: getStrokeColor(animatedScore),
              }}
              role="progressbar"
              aria-valuenow={animatedScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Sustainability score progress: ${animatedScore}%`}
            />
          </div>

          <p className="text-xs text-slate-400 mt-2">{scoreDescription}</p>
        </div>
      </div>
    </section>
  );
}

export default memo(SustainabilityScore);
