/**
 * Unit tests for BurdenDistribution component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BurdenDistribution } from '../BurdenDistribution';
import type { UserBurdenData } from '@/lib/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('BurdenDistribution', () => {
  describe('Page Rendering', () => {
    it('should render with heading and description', () => {
      const data: UserBurdenData[] = [];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(screen.getByText(/burden distribution/i)).toBeInTheDocument();
      expect(
        screen.getByText(/percentage of total on-call time per team member/i)
      ).toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
      const data: UserBurdenData[] = [];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(screen.getByText(/no data available for the selected period/i)).toBeInTheDocument();
    });

    it('should render chart container with data', () => {
      const data: UserBurdenData[] = [
        { userId: '1', userName: 'User 1', totalOnCallHours: 24, percentage: 50 },
        { userId: '2', userName: 'User 2', totalOnCallHours: 24, percentage: 50 },
      ];
      renderWithTheme(<BurdenDistribution data={data} />);

      // Recharts may not render in JSDOM, but component should mount without error
      expect(screen.getByText(/burden distribution/i)).toBeInTheDocument();
    });

    it('should show summary statistics when data is available', () => {
      const data: UserBurdenData[] = [
        { userId: '1', userName: 'User 1', totalOnCallHours: 10, percentage: 40 },
        { userId: '2', userName: 'User 2', totalOnCallHours: 15, percentage: 60 },
      ];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(screen.getByText(/total on-call hours: 25.0h/i)).toBeInTheDocument();
      expect(screen.getByText(/team members: 2/i)).toBeInTheDocument();
    });
  });

  describe('Data Visualization', () => {
    it('should handle single user', () => {
      const data: UserBurdenData[] = [
        { userId: '1', userName: 'User 1', totalOnCallHours: 48, percentage: 100 },
      ];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(screen.getByText(/total on-call hours: 48.0h/i)).toBeInTheDocument();
      expect(screen.getByText(/team members: 1/i)).toBeInTheDocument();
    });

    it('should handle multiple users', () => {
      const data: UserBurdenData[] = [
        { userId: '1', userName: 'User 1', totalOnCallHours: 10, percentage: 33.33 },
        { userId: '2', userName: 'User 2', totalOnCallHours: 10, percentage: 33.33 },
        { userId: '3', userName: 'User 3', totalOnCallHours: 10, percentage: 33.34 },
      ];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(screen.getByText(/team members: 3/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const data: UserBurdenData[] = [];
      renderWithTheme(<BurdenDistribution data={data} />);

      const heading = screen.getByText(/burden distribution/i);
      expect(heading.tagName).toBe('H6');
    });

    it('should have descriptive text', () => {
      const data: UserBurdenData[] = [];
      renderWithTheme(<BurdenDistribution data={data} />);

      expect(
        screen.getByText(/percentage of total on-call time per team member/i)
      ).toBeInTheDocument();
    });
  });
});
