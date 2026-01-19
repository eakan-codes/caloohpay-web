/**
 * Unit tests for DateRangePicker component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DateRangePicker } from '../DateRangePicker';
import { DateTime } from 'luxon';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DateRangePicker', () => {
  const mockOnChange = jest.fn();
  const now = DateTime.now();
  const threeMonthsAgo = now.minus({ months: 3 });

  const defaultProps = {
    currentSince: threeMonthsAgo.toISO() || '',
    currentUntil: now.toISO() || '',
    onDateRangeChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the button', () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    expect(screen.getByRole('button', { name: /custom date range/i })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Select Date Range')).toBeInTheDocument();
    });
  });

  it('should display start and end date inputs', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });
  });

  it('should display quick select buttons', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /last month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /last 3 months/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /last 6 months/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /last year/i })).toBeInTheDocument();
    });
  });

  it('should display constraint information', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/maximum range: 1 year/i)).toBeInTheDocument();
      expect(screen.getByText(/cannot go back more than 2 years/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid date range (end before start)', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startInput, { target: { value: '2024-12-01' } });
      fireEvent.change(endInput, { target: { value: '2024-11-01' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should show error for range exceeding 1 year', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    // Use recent dates that exceed 1 year but are within 2 years
    const startDate = DateTime.now().minus({ months: 13 }).toFormat('yyyy-MM-dd');
    const endDate = DateTime.now().toFormat('yyyy-MM-dd');

    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startInput, { target: { value: startDate } });
      fireEvent.change(endInput, { target: { value: endDate } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/date range cannot exceed 1 year/i)).toBeInTheDocument();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should show error for start date more than 2 years ago', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    const twoYearsOneMonthAgo = DateTime.now().minus({ years: 2, months: 1 });

    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startInput, {
        target: { value: twoYearsOneMonthAgo.toFormat('yyyy-MM-dd') },
      });
      fireEvent.change(endInput, { target: { value: DateTime.now().toFormat('yyyy-MM-dd') } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/cannot be more than 2 years in the past/i)).toBeInTheDocument();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should call onChange with valid date range', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startInput, { target: { value: '2024-06-01' } });
      fireEvent.change(endInput, { target: { value: '2024-09-01' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('2024-06-01'),
        expect.stringContaining('2024-09-01')
      );
    });
  });

  it('should close dialog when cancel is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should update dates when quick select button is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    await waitFor(() => {
      const lastMonthButton = screen.getByRole('button', { name: /last month/i });
      fireEvent.click(lastMonthButton);
    });

    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      // Verify dates were updated (approximately)
      expect(startInput.value).toBeTruthy();
      expect(endInput.value).toBeTruthy();
    });
  });

  it('should clear error when valid input is provided after error', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    const button = screen.getByRole('button', { name: /custom date range/i });
    fireEvent.click(button);

    // First, trigger an error
    await waitFor(() => {
      const startInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startInput, { target: { value: '2024-12-01' } });
      fireEvent.change(endInput, { target: { value: '2024-11-01' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });

    // Then fix the error
    await waitFor(() => {
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      fireEvent.change(endInput, { target: { value: '2024-12-31' } });
    });

    await waitFor(() => {
      expect(screen.queryByText(/end date must be after start date/i)).not.toBeInTheDocument();
    });
  });
});
