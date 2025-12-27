import { render, screen } from '@testing-library/react';
import ScheduleActions from '../ScheduleActions';

describe('ScheduleActions', () => {
  const defaultProps = {
    htmlUrl: 'https://company.pagerduty.com/schedules/ABC123',
    hasSchedules: true,
  };

  it('renders Calculate Payments button', () => {
    render(<ScheduleActions {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Calculate Payments/i })).toBeInTheDocument();
  });

  it('renders View in PagerDuty button', () => {
    render(<ScheduleActions {...defaultProps} />);
    const link = screen.getByRole('link', { name: /View in PagerDuty/i });
    expect(link).toBeInTheDocument();
  });

  it('disables Calculate Payments button when no schedules', () => {
    render(<ScheduleActions {...defaultProps} hasSchedules={false} />);
    const calculateButton = screen.getByRole('button', { name: /Calculate Payments/i });
    expect(calculateButton).toBeDisabled();
  });

  it('enables Calculate Payments button when schedules exist', () => {
    render(<ScheduleActions {...defaultProps} hasSchedules={true} />);
    const calculateButton = screen.getByRole('button', { name: /Calculate Payments/i });
    expect(calculateButton).not.toBeDisabled();
  });

  it('links to correct PagerDuty URL', () => {
    render(<ScheduleActions {...defaultProps} />);
    const pagerdutyLink = screen.getByRole('link', { name: /View in PagerDuty/i });
    expect(pagerdutyLink).toHaveAttribute('href', defaultProps.htmlUrl);
    expect(pagerdutyLink).toHaveAttribute('target', '_blank');
    expect(pagerdutyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('updates link when htmlUrl changes', () => {
    const { rerender } = render(<ScheduleActions {...defaultProps} />);
    const newUrl = 'https://company.pagerduty.com/schedules/XYZ789';

    rerender(<ScheduleActions htmlUrl={newUrl} hasSchedules={true} />);

    const pagerdutyLink = screen.getByRole('link', { name: /View in PagerDuty/i });
    expect(pagerdutyLink).toHaveAttribute('href', newUrl);
  });
});
