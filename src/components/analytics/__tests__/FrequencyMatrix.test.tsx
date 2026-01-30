/**
 * Unit tests for FrequencyMatrix component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FrequencyMatrix } from '../FrequencyMatrix';
import type { FrequencyMatrixCell } from '@/lib/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('FrequencyMatrix', () => {
  describe('Page Rendering', () => {
    it('should render with empty data', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} />);

      expect(screen.getByText(/frequency matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/shows when on-call shifts occur/i)).toBeInTheDocument();
    });

    it('should render with user name when provided', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} userName="John Doe" />);

      expect(screen.getByText(/frequency matrix - john doe/i)).toBeInTheDocument();
    });

    it('should render day labels', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} />);

      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('should render hour labels (0-23)', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} />);

      // Check a few hour labels
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should render legend', () => {
      const data: FrequencyMatrixCell[] = [{ dayOfWeek: 0, hour: 0, count: 5 }];
      renderWithTheme(<FrequencyMatrix data={data} />);

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText(/High \(5 shifts\)/)).toBeInTheDocument();
    });
  });

  describe('Data Visualization', () => {
    it('should display cell counts when count > 0', () => {
      const data: FrequencyMatrixCell[] = [
        { dayOfWeek: 0, hour: 9, count: 17 }, // Use 17 to avoid collision with hour labels
        { dayOfWeek: 1, hour: 14, count: 19 }, // Use 19 to avoid collision
      ];
      const { container } = renderWithTheme(<FrequencyMatrix data={data} />);

      // Check that cells with counts are rendered (they may appear multiple times due to MUI)
      // We look for aria-label which replaced the title attribute
      const cellElements = container.querySelectorAll('[aria-label*="shifts"]');
      expect(cellElements.length).toBeGreaterThan(0);

      // Check specific cell exists
      const cell17 = container.querySelector('[aria-label="Sun 9 AM: 17 shifts"]');
      expect(cell17).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      // Create data for all 7 days x 24 hours
      const data: FrequencyMatrixCell[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          data.push({ dayOfWeek: day, hour, count: day + hour });
        }
      }

      renderWithTheme(<FrequencyMatrix data={data} />);
      expect(screen.getByText(/frequency matrix/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} />);

      const heading = screen.getByText(/frequency matrix/i);
      expect(heading.tagName).toBe('H6');
    });

    it('should have descriptive text', () => {
      const data: FrequencyMatrixCell[] = [];
      renderWithTheme(<FrequencyMatrix data={data} />);

      expect(
        screen.getByText(/shows when on-call shifts occur most frequently/i)
      ).toBeInTheDocument();
    });
  });
});
