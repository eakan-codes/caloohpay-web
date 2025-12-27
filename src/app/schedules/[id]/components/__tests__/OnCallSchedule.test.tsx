import { render, screen } from '@testing-library/react';
import OnCallSchedule from '../OnCallSchedule';
import type { OnCallScheduleProps } from '../OnCallSchedule.types';

// Mock the Loading component
jest.mock('@/components/common', () => ({
  ...jest.requireActual('@/components/common'),
  Loading: () => <div data-testid="loading-component">Loading...</div>,
}));

describe('OnCallSchedule', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    summary: 'John Doe',
    avatar_url: '',
    html_url: 'https://example.com',
  };

  const mockEntry = {
    start: new Date('2025-01-15T10:00:00Z'),
    end: new Date('2025-01-15T14:00:00Z'),
    user: mockUser,
    duration: 4,
    weekdayDays: 1,
    weekendDays: 0,
    compensation: 50,
  };

  const defaultProps: OnCallScheduleProps = {
    userSchedules: [
      {
        user: mockUser,
        entries: [mockEntry],
        totalHours: 4,
        totalWeekdays: 1,
        totalWeekends: 0,
        totalCompensation: 50,
      },
    ],
    currentMonthDisplay: 'January 2025',
    timeZone: 'Europe/London',
    isLoading: false,
  };

  it('renders loading state when isLoading is true', () => {
    render(<OnCallSchedule {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('renders empty state when no schedules', () => {
    render(<OnCallSchedule {...defaultProps} userSchedules={[]} />);
    expect(screen.getByText('No On-Call Periods')).toBeInTheDocument();
    expect(
      screen.getByText(/There are no on-call periods scheduled for January 2025/)
    ).toBeInTheDocument();
  });

  it('renders schedule title with user count', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText(/On-Call Schedule \(1 person\)/)).toBeInTheDocument();
  });

  it('renders correct plural text for multiple users', () => {
    const multiUserProps: OnCallScheduleProps = {
      ...defaultProps,
      userSchedules: [defaultProps.userSchedules[0], defaultProps.userSchedules[0]],
    };
    render(<OnCallSchedule {...multiUserProps} />);
    expect(screen.getByText(/On-Call Schedule \(2 people\)/)).toBeInTheDocument();
  });

  it('renders user name', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user email', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders total hours', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('4.0 hours')).toBeInTheDocument();
  });

  it('renders weekday and weekend counts', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('1 weekdays')).toBeInTheDocument();
    expect(screen.getByText('0 weekends')).toBeInTheDocument();
  });

  it('renders total compensation', () => {
    render(<OnCallSchedule {...defaultProps} />);
    const compensationChips = screen.getAllByText('£50.00');
    expect(compensationChips.length).toBeGreaterThan(0);
  });

  it('renders on-call periods section', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('On-Call Periods (1)')).toBeInTheDocument();
  });

  it('renders multiple on-call periods for a user', () => {
    const multiPeriodProps: OnCallScheduleProps = {
      ...defaultProps,
      userSchedules: [
        {
          ...defaultProps.userSchedules[0],
          entries: [mockEntry, { ...mockEntry, duration: 8, weekdayDays: 2, compensation: 100 }],
        },
      ],
    };
    render(<OnCallSchedule {...multiPeriodProps} />);
    expect(screen.getByText('On-Call Periods (2)')).toBeInTheDocument();
  });

  it('renders duration for each period', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('4.0h')).toBeInTheDocument();
  });

  it('renders weekday chips only when weekdayDays > 0', () => {
    render(<OnCallSchedule {...defaultProps} />);
    expect(screen.getByText('1 WD')).toBeInTheDocument();
  });

  it('hides weekday chips when weekdayDays is 0', () => {
    const noWeekdayProps: OnCallScheduleProps = {
      ...defaultProps,
      userSchedules: [
        {
          ...defaultProps.userSchedules[0],
          entries: [{ ...mockEntry, weekdayDays: 0, weekendDays: 1, totalCompensation: 75 }],
        },
      ],
    };
    render(<OnCallSchedule {...noWeekdayProps} />);
    expect(screen.queryByText(/WD/)).not.toBeInTheDocument();
  });

  it('renders weekend chips only when weekendDays > 0', () => {
    const weekendProps: OnCallScheduleProps = {
      ...defaultProps,
      userSchedules: [
        {
          ...defaultProps.userSchedules[0],
          entries: [{ ...mockEntry, weekdayDays: 0, weekendDays: 2 }],
        },
      ],
    };
    render(<OnCallSchedule {...weekendProps} />);
    expect(screen.getByText('2 WE')).toBeInTheDocument();
  });
});
