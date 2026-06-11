/**
 * EcoMind AI Ultra — Logging Page
 * Carbon footprint logging interface with history.
 */

import { LogForm } from './LogForm';
import { ActivityFeed } from '../dashboard/ActivityFeed';

export function LoggingPage() {
  return (
    <main className="space-y-6" role="main">
      <header>
        <h1 className="text-2xl font-bold text-white">Log Your Footprint</h1>
        <p className="text-slate-400 mt-1">Track your daily activities and see your carbon impact in real time.</p>
      </header>

      <LogForm />
      <ActivityFeed />
    </main>
  );
}
