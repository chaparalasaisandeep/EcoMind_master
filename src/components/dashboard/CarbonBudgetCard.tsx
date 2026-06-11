/**
 * EcoMind AI Ultra — Carbon Budget Wallet Card
 * Banking-style budget display with animated progress and alerts.
 */

import { useMemo, memo } from 'react';
import { Wallet, AlertTriangle, TrendingDown } from 'lucide-react';

interface CarbonBudgetCardProps {
  monthlyBudget: number;
  usedAmount: number;
  warningThreshold: number;
}

export function CarbonBudgetCard({ monthlyBudget, usedAmount, warningThreshold }: CarbonBudgetCardProps) {
  const remaining = Math.max(0, monthlyBudget - usedAmount);
  const percentage = Math.min(100, (usedAmount / monthlyBudget) * 100);
  const isWarning = percentage >= warningThreshold * 100;
  const isCritical = percentage >= 100;

  const dailyAllowance = monthlyBudget / 30;
  const daysLeft = Math.ceil(remaining / dailyAllowance);

  const getColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label={`Carbon budget: ${percentage.toFixed(1)}% used`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">Carbon Budget</h2>
        </div>
        {isWarning && (
          <div className="flex items-center gap-1 text-amber-400 text-sm" role="alert" aria-label="Carbon budget warning">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            <span>Warning</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Monthly Budget</p>
            <p className="text-2xl font-bold text-white" aria-label={`Monthly carbon budget: ${monthlyBudget.toFixed(1)} kg CO2e`}>
              {monthlyBudget.toFixed(1)} kg CO2e
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Remaining</p>
            <p
              className={`text-2xl font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}
              aria-label={`Carbon budget remaining: ${remaining.toFixed(1)} kg CO2e`}
            >
              {remaining.toFixed(1)} kg CO2e
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Used</span>
            <span className={isCritical ? 'text-red-400' : 'text-white'}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div
            className="w-full bg-slate-800 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Carbon budget used: ${percentage.toFixed(1)}%`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <TrendingDown className="w-4 h-4" aria-hidden="true" />
          <span role="status">
            {isCritical
              ? 'Budget exceeded! Reduce emissions immediately.'
              : `${daysLeft} days of budget remaining at current pace.`}
          </span>
        </div>
      </div>
    </section>
  );
}

export default memo(CarbonBudgetCard);
