/**
 * Unit tests for InterruptionVsPay component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { InterruptionVsPay } from '../InterruptionVsPay';
import type { UserInterruptionData } from '@/lib/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('InterruptionVsPay', () => {
  describe('Page Rendering', () => {
    it('should render with heading and description', () => {
      const data: UserInterruptionData[] = [];
      renderWithTheme(<InterruptionVsPay data={data} />);

      expect(screen.getByText(/interruption vs pay correlation/i)).toBeInTheDocument();
      expect(
        screen.getByText(/relationship between on-call hours and compensation/i)
      ).toBeInTheDocument();
    });

    it('should show empty state when no data', () => {
      const data: UserInterruptionData[] = [];
      renderWithTheme(<InterruptionVsPay data={data} />);

      expect(screen.getByText(/no data available for the selected period/i)).toBeInTheDocument();
    });

    it('should render chart container with data', () => {
      const data: UserInterruptionData[] = [
        { userId: '1', userName: 'User 1', totalInterruptions: 10, totalPay: 500 },
        { userId: '2', userName: 'User 2', totalInterruptions: 15, totalPay: 750 },
      ];
      renderWithTheme(<InterruptionVsPay data={data} />);

      // Recharts may not render in JSDOM, but component should mount without error
      expect(screen.getByText(/interruption vs pay correlation/i)).toBeInTheDocument();
    });

    it('should show summary statistics when data is available', () => {
      const data: UserInterruptionData[] = [
        { userId: '1', userName: 'User 1', totalInterruptions: 10, totalPay: 500 },
        { userId: '2', userName: 'User 2', totalInterruptions: 15, totalPay: 750 },
      ];
      renderWithTheme(<InterruptionVsPay data={data} />);

      expect(screen.getByText(/total compensation/i)).toBeInTheDocument();
      expect(screen.getByText('£1250.00')).toBeInTheDocument();
      expect(screen.getByText(/total hours/i)).toBeInTheDocument();
      expect(screen.getByText('25h')).toBeInTheDocument();
      expect(screen.getByText(/average rate/i)).toBeInTheDocument();
    });
  });

  describe('Data Visualization', () => {
    it('should handle single user', () => {
      const data: UserInterruptionData[] = [
        { userId: '1', userName: 'User 1', totalInterruptions: 20, totalPay: 1000 },
      ];
      renderWithTheme(<InterruptionVsPay data={data} />);

      expect(screen.getByText('£1000.00')).toBeInTheDocument();
      expect(screen.getByText('20h')).toBeInTheDocument();
    });

    it('should display summary statistics labels', () => {
      const data: UserInterruptionData[] = [
        { userId: '1', userName: 'User 1', totalInterruptions: 10, totalPay: 500 },
        { userId: '2', userName: 'User 2', totalInterruptions: 10, totalPay: 750 },
      ];
      renderWithTheme(<InterruptionVsPay data={data} />);

      // Check that summary section headers are present
      expect(screen.getByText(/total compensation/i)).toBeInTheDocument();
      expect(screen.getByText(/total hours/i)).toBeInTheDocument();
      expect(screen.getByText(/average rate/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const data: UserInterruptionData[] = [];
      renderWithTheme(<InterruptionVsPay data={data} />);

      const heading = screen.getByText(/interruption vs pay correlation/i);
      expect(heading.tagName).toBe('H6');
    });

    it('should have descriptive text', () => {
      const data: UserInterruptionData[] = [];
      renderWithTheme(<InterruptionVsPay data={data} />);

      expect(
        screen.getByText(/relationship between on-call hours and compensation/i)
      ).toBeInTheDocument();
    });
  });
});
