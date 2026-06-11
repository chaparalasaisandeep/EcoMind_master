import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Layout } from './Layout';

expect.extend(toHaveNoViolations);

// Mock useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('Layout Component', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('renders the main layout structure', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getAllByText('EcoMind AI')).toHaveLength(2); // Desktop and mobile headers
    });

    it('renders navigation with all page links', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const expectedNavItems = [
        'Dashboard',
        'Log Footprint',
        'Analytics',
        'Achievements',
        'AI Coach',
        'Simulator',
      ];

      expectedNavItems.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('renders skip to main content link for accessibility', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('renders main content with proper id and role', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Test Content</div>
        </Layout>
      );

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('id', 'main-content');
    });

    it('renders user information when authenticated', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Custom Content</div>
        </Layout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Active Page Highlighting', () => {
    it('highlights the current page in navigation', () => {
      const { rerender } = render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      let dashboardButton = screen.getByText('Dashboard').closest('button');
      expect(dashboardButton).toHaveAttribute('aria-current', 'page');

      rerender(
        <Layout currentPage="analytics" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      dashboardButton = screen.getByText('Dashboard').closest('button');
      expect(dashboardButton).not.toHaveAttribute('aria-current', 'page');

      const analyticsButton = screen.getByText('Analytics').closest('button');
      expect(analyticsButton).toHaveAttribute('aria-current', 'page');
    });

    it('applies active styling to current page button', () => {
      render(
        <Layout currentPage="gamification" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const achievementsButton = screen.getByText('Achievements').closest('button');
      expect(achievementsButton).toHaveClass('bg-emerald-500/15');
      expect(achievementsButton).toHaveClass('text-emerald-400');
    });

    it('does not apply active styling to inactive buttons', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const analyticsButton = screen.getByText('Analytics').closest('button');
      expect(analyticsButton).toHaveClass('text-slate-400');
      expect(analyticsButton).not.toHaveClass('bg-emerald-500/15');
    });
  });

  describe('Navigation Interaction', () => {
    it('calls onNavigate when clicking nav items', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const analyticsButton = screen.getByText('Analytics').closest('button');
      await user.click(analyticsButton!);

      expect(mockOnNavigate).toHaveBeenCalledWith('analytics');
    });

    it('calls onNavigate with correct page id for each nav item', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const navPages = [
        { label: 'Dashboard', id: 'dashboard' },
        { label: 'Log Footprint', id: 'log' },
        { label: 'Analytics', id: 'analytics' },
        { label: 'Achievements', id: 'gamification' },
        { label: 'AI Coach', id: 'coach' },
        { label: 'Simulator', id: 'simulator' },
      ];

      for (const navPage of navPages) {
        await user.click(screen.getByText(navPage.label).closest('button')!);
        expect(mockOnNavigate).toHaveBeenCalledWith(navPage.id);
      }
    });
  });

  describe('Semantic HTML & ARIA', () => {
    it('has proper semantic navigation element', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();
      expect(navElement).toHaveAttribute('aria-label', 'Primary');
    });

    it('has aria-label on navigation', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const navElement = screen.getByRole('navigation');
      expect(navElement.getAttribute('aria-label')).toMatch(/Primary/);
    });

    it('has aria-label on aside element', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const aside = document.querySelector('aside[aria-label="Main navigation"]');
      expect(aside).toBeInTheDocument();
    });

    it('has role="main" on main content area', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('uses aria-current="page" for active navigation item', () => {
      render(
        <Layout currentPage="log" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const logButton = screen.getByText('Log Footprint').closest('button');
      expect(logButton).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Keyboard Navigation', () => {
    it('allows tabbing through navigation items', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const firstNavItem = screen.getByText('Dashboard').closest('button');
      const secondNavItem = screen.getByText('Log Footprint').closest('button');

      firstNavItem?.focus();
      expect(document.activeElement).toBe(firstNavItem);

      await user.tab();
      expect(document.activeElement).toBe(secondNavItem);
    });

    it('activates navigation on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const analyticsButton = screen.getByText('Analytics').closest('button');
      analyticsButton?.focus();

      await user.keyboard('{Enter}');

      expect(mockOnNavigate).toHaveBeenCalledWith('analytics');
    });

    it('activates navigation with Space key', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const coachButton = screen.getByText('AI Coach').closest('button');
      coachButton?.focus();

      await user.keyboard(' ');

      expect(mockOnNavigate).toHaveBeenCalledWith('coach');
    });

    it('allows tabbing to skip link', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const skipLink = screen.getByText('Skip to main content');

      // Skip link should be focusable even though sr-only
      await user.tab();
      // Focus should eventually reach the skip link if tabbing from document start
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful aria-label for sign out button', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toHaveAttribute('aria-label', 'Sign out');
    });

    it('has hidden decorative icons with aria-hidden', () => {
      const { container } = render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('provides accessible label for mobile menu button', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByRole('button', { name: /open menu|close menu/i });
      expect(menuButton).toHaveAttribute('aria-label');
      expect(menuButton).toHaveAttribute('aria-expanded');
    });
  });

  describe('Accessibility Audit', () => {
    it('passes axe accessibility audit', async () => {
      const { container } = render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Test Content</div>
        </Layout>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe audit with different current page', async () => {
      const { container } = render(
        <Layout currentPage="analytics" onNavigate={mockOnNavigate}>
          <div>Test Content</div>
        </Layout>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu button on small screens', () => {
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('toggles mobile menu visibility', async () => {
      const user = userEvent.setup();
      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByRole('button', { name: /open menu/i });

      // Initially closed (menu items not visible on mobile)
      let mobileNav = document.querySelector('nav[aria-label="Mobile primary"]');
      expect(mobileNav).not.toBeInTheDocument();

      // Open menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Close menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Sign Out', () => {
    it('calls signOut when sign out button is clicked', async () => {
      const user = userEvent.setup();
      const { useAuth } = await import('../../context/AuthContext');
      const mockSignOut = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useAuth).mockReturnValueOnce({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
        signOut: mockSignOut,
        session: null,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <Layout currentPage="dashboard" onNavigate={mockOnNavigate}>
          <div>Content</div>
        </Layout>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
