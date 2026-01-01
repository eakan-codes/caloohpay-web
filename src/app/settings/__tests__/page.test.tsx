/**
 * Settings Page Integration Tests
 * Tests page-level functionality for user settings customization
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionProvider';
import SettingsPage from '../page';
import { reloadSettingsFromStorage } from '@/lib/stores';
import { ReactNode } from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/settings',
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      accessToken: 'test-token',
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Wrapper component with all providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};

const renderSettingsPage = () => render(<SettingsPage />, { wrapper: AllTheProviders });

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    reloadSettingsFromStorage();
  });

  describe('Page Rendering', () => {
    it('should render the settings page with heading and form', () => {
      renderSettingsPage();
      expect(screen.getByRole('heading', { level: 1, name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /weekday rate/i })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /weekend rate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should display default rate values from store', () => {
      renderSettingsPage();
      const weekdayInput = screen.getByRole('spinbutton', {
        name: /weekday rate/i,
      }) as HTMLInputElement;
      const weekendInput = screen.getByRole('spinbutton', {
        name: /weekend rate/i,
      }) as HTMLInputElement;
      expect(weekdayInput.value).toBe('50'); // Default from store
      expect(weekendInput.value).toBe('75'); // Default from store
    });

    it('should display rate information note', () => {
      renderSettingsPage();
      expect(screen.getByText(/these rates are used to calculate/i)).toBeInTheDocument();
    });
  });

  describe('User Workflows', () => {
    it('should allow user to update weekday rate', async () => {
      const user = userEvent.setup();
      renderSettingsPage();
      const weekdayInput = screen.getByRole('spinbutton', {
        name: /weekday rate/i,
      }) as HTMLInputElement;

      // Type new value (don't clear - just select and type)
      await user.click(weekdayInput);
      await user.keyboard('{Control>}a{/Control}'); // Select all
      await user.keyboard('60');

      expect(weekdayInput.value).toBe('60');
    });

    it('should persist changes to localStorage when save is clicked', async () => {
      const user = userEvent.setup();
      renderSettingsPage();
      const weekdayInput = screen.getByRole('spinbutton', {
        name: /weekday rate/i,
      }) as HTMLInputElement;
      const saveButton = screen.getByRole('button', { name: /save/i });

      // Make a change
      await user.click(weekdayInput);
      await user.keyboard('{Control>}a{/Control}'); // Select all
      await user.keyboard('60');

      // Click save
      await user.click(saveButton);

      // Verify localStorage was written (async operation)
      await waitFor(() => {
        const stored = localStorage.getItem('settings');
        expect(stored).toBeTruthy();
        expect(stored).toContain('60');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderSettingsPage();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have labeled form inputs for screen readers', () => {
      renderSettingsPage();
      expect(screen.getByRole('spinbutton', { name: /weekday rate/i })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /weekend rate/i })).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should render without errors with all providers', () => {
      expect(() => renderSettingsPage()).not.toThrow();
    });

    it('should integrate with useSettings hook', () => {
      const { container } = renderSettingsPage();
      expect(container).toBeInTheDocument();
      // Verify form rendered with values from hook
      const weekdayInput = screen.getByRole('spinbutton', {
        name: /weekday rate/i,
      }) as HTMLInputElement;
      expect(weekdayInput.value).toBe('50'); // Value from useSettings hook
    });
  });
});
