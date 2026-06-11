/**
 * EcoMind AI Ultra — Main Layout Component
 * Responsive layout with navigation, sidebar, and main content area.
 * Accessibility: Skip links, ARIA landmarks, keyboard navigation.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Footprints,
  BarChart3,
  Gamepad2,
  Brain,
  Settings,
  Menu,
  X,
  LogOut,
  Leaf,
  User,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log', label: 'Log Footprint', icon: Footprints },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'gamification', label: 'Achievements', icon: Gamepad2 },
  { id: 'coach', label: 'AI Coach', icon: Brain },
  { id: 'simulator', label: 'Simulator', icon: Settings },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 fixed h-full z-30"
        aria-label="Main navigation"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">EcoMind AI</h1>
            <p className="text-xs text-slate-400">Ultra</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1" role="navigation" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            <span className="font-bold text-white">EcoMind AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-1" role="navigation" aria-label="Mobile primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                Sign Out
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen"
        role="main"
        tabIndex={-1}
      >
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
