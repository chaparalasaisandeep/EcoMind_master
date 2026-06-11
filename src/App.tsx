/**
 * EcoMind AI Ultra — Main Application
 * Router and layout orchestration with auth protection, lazy loading, and error boundaries.
 */

import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/common/Layout';
import { AuthPage } from './components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

type Page = 'dashboard' | 'log' | 'analytics' | 'gamification' | 'coach' | 'simulator';

const DashboardPage = lazy(() =>
  import('./components/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const LoggingPage = lazy(() =>
  import('./components/logging/LoggingPage').then((m) => ({ default: m.LoggingPage }))
);
const AnalyticsPage = lazy(() =>
  import('./components/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const GamificationPage = lazy(() =>
  import('./components/gamification/GamificationPage').then((m) => ({ default: m.GamificationPage }))
);
const AiCoachPage = lazy(() =>
  import('./components/coach/AiCoachPage').then((m) => ({ default: m.AiCoachPage }))
);
const SimulatorPage = lazy(() =>
  import('./components/simulator/SimulatorPage').then((m) => ({ default: m.SimulatorPage }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" aria-hidden="true" />
        <span className="ml-3 text-slate-400">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'log':
        return <LoggingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'gamification':
        return <GamificationPage />;
      case 'coach':
        return <AiCoachPage />;
      case 'simulator':
        return <SimulatorPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)}>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
