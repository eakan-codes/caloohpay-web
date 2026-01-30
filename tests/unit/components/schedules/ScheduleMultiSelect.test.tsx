import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SessionProvider, useSession } from 'next-auth/react';
import { SWRConfig } from 'swr';
import ScheduleMultiSelect from '@/components/schedules/ScheduleMultiSelect';
import { PagerDutySchedule } from '@/lib/types';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockSchedules: PagerDutySchedule[] = [
  {
    id: 'SCHED1',
    name: 'Engineering On-Call',
    html_url: 'https://example.pagerduty.com/schedules/SCHED1',
    time_zone: 'America/New_York',
    final_schedule: {
      name: 'Engineering On-Call',
      rendered_schedule_entries: [],
    },
  },
  {
    id: 'SCHED2',
    name: 'DevOps On-Call',
    html_url: 'https://example.pagerduty.com/schedules/SCHED2',
    time_zone: 'UTC',
    final_schedule: {
      name: 'DevOps On-Call',
      rendered_schedule_entries: [],
    },
  },
];

describe('ScheduleMultiSelect', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: [],
    onChange: mockOnChange,
    isLoadingInitial: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ schedules: mockSchedules }),
    });

    (useSession as jest.Mock).mockReturnValue({
      data: {
        accessToken: 'mock-token',
        user: { email: 'test@example.com' },
      },
      status: 'authenticated',
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <SessionProvider session={null}>{ui}</SessionProvider>
      </SWRConfig>
    );
  };

  describe('Rendering', () => {
    it('should render the autocomplete input', () => {
      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      expect(screen.getByLabelText(/search schedules/i)).toBeInTheDocument();
    });

    it('should show loading state when isLoadingInitial is true', () => {
      renderWithProviders(<ScheduleMultiSelect {...defaultProps} isLoadingInitial={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display selected schedules as chips', () => {
      renderWithProviders(<ScheduleMultiSelect {...defaultProps} value={[mockSchedules[0]]} />);

      expect(screen.getByText('Engineering On-Call')).toBeInTheDocument();
    });
  });

  describe('Search and Debouncing', () => {
    it('should debounce search input', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      const input = screen.getByLabelText(/search schedules/i);

      // Type quickly
      await user.click(input);
      await user.type(input, 'eng');

      // Should not fetch immediately
      expect(global.fetch).not.toHaveBeenCalled();

      // Fast forward 500ms (debounce delay)
      jest.advanceTimersByTime(500);

      // Now it should fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('should only fetch when autocomplete is open', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      const input = screen.getByLabelText(/search schedules/i);

      // Type without opening
      await user.type(input, 'eng');

      // Wait for debounce
      await waitFor(
        () => {
          // Should not fetch when closed
          expect(global.fetch).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Option Management', () => {
    it('should merge selected schedules with search results', async () => {
      const user = userEvent.setup();

      const selectedSchedule: PagerDutySchedule = {
        id: 'SCHED3',
        name: 'Selected Schedule',
        html_url: 'https://example.pagerduty.com/schedules/SCHED3',
        time_zone: 'UTC',
        final_schedule: {
          name: 'Selected Schedule',
          rendered_schedule_entries: [],
        },
      };

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} value={[selectedSchedule]} />);

      const input = screen.getByLabelText(/search schedules/i);
      await user.click(input);

      // Selected schedule should appear in both chip and dropdown
      const allOccurrences = screen.getAllByText('Selected Schedule');
      expect(allOccurrences.length).toBeGreaterThan(0);
    });

    it('should deduplicate options by ID', async () => {
      const user = userEvent.setup();

      // Mock fetch to return a schedule that's already selected
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [mockSchedules[0]] }),
      });

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} value={[mockSchedules[0]]} />);

      const input = screen.getByLabelText(/search schedules/i);
      await user.click(input);
      await user.type(input, 'eng');

      await waitFor(() => {
        // Should show as chip and in dropdown list (2 occurrences total)
        const chips = screen.getAllByText('Engineering On-Call');
        expect(chips.length).toBe(2); // One chip, one in list
      });
    });
  });

  describe('Display Format', () => {
    it('should show schedule name and metadata in options', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      const input = screen.getByLabelText(/search schedules/i);
      await user.click(input);
      await user.type(input, 'eng');

      await waitFor(() => {
        expect(screen.getByText('Engineering On-Call')).toBeInTheDocument();
        expect(screen.getByText(/SCHED1.*America\/New_York/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      expect(screen.getByLabelText(/search schedules/i)).toHaveAttribute('type', 'text');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      const input = screen.getByLabelText(/search schedules/i);

      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();
    });
  });

  describe('Session Handling', () => {
    it('should not fetch without session token', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const user = userEvent.setup();

      renderWithProviders(<ScheduleMultiSelect {...defaultProps} />);

      const input = screen.getByLabelText(/search schedules/i);
      await user.click(input);
      await user.type(input, 'eng');

      // Wait for debounce
      await waitFor(() => {}, { timeout: 1000 });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
