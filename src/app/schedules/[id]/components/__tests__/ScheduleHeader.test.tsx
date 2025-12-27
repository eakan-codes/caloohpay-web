import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleHeader from '../ScheduleHeader';

describe('ScheduleHeader', () => {
  const defaultProps = {
    scheduleName: 'Engineering On-Call',
    scheduleDescription: 'Primary engineering schedule',
    timeZone: 'Europe/London',
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders schedule name', () => {
    render(<ScheduleHeader {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Engineering On-Call/i })).toBeInTheDocument();
  });

  it('renders schedule description when provided', () => {
    render(<ScheduleHeader {...defaultProps} />);
    expect(screen.getByText('Primary engineering schedule')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { scheduleDescription, ...props } = defaultProps;
    render(<ScheduleHeader {...props} />);
    expect(screen.queryByText('Primary engineering schedule')).not.toBeInTheDocument();
  });

  it('renders timezone chip with AccessTime icon', () => {
    render(<ScheduleHeader {...defaultProps} />);
    const chip = screen.getByText('Europe/London');
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('AccessTimeIcon')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduleHeader {...defaultProps} />);

    const backButtons = screen.getAllByRole('button');
    const backButton = backButtons[0]; // First button should be the back button

    await user.click(backButton);
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('handles different timezones', () => {
    render(<ScheduleHeader {...defaultProps} timeZone="America/New_York" />);
    expect(screen.getByText('America/New_York')).toBeInTheDocument();
  });

  it('handles schedule names with special characters', () => {
    render(<ScheduleHeader {...defaultProps} scheduleName="On-Call Schedule (Primary) v2.0" />);
    expect(
      screen.getByRole('heading', { name: /On-Call Schedule \(Primary\) v2\.0/i })
    ).toBeInTheDocument();
  });
});
