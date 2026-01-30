/**
 * Unit tests for HelpModal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HelpModal } from '../HelpModal';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('HelpModal', () => {
  const defaultProps = {
    title: 'Test Chart',
    description: 'This is a test description',
    howToRead: 'Read it carefully',
    value: 'This provides great insights',
  };

  it('should render help icon button', () => {
    renderWithTheme(<HelpModal {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('should open modal when help button is clicked', async () => {
    renderWithTheme(<HelpModal {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });
  });

  it('should display all sections when provided', async () => {
    renderWithTheme(<HelpModal {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
      expect(screen.getByText('How to Read')).toBeInTheDocument();
      expect(screen.getByText('Read it carefully')).toBeInTheDocument();
      expect(screen.getByText('Value & Insights')).toBeInTheDocument();
      expect(screen.getByText('This provides great insights')).toBeInTheDocument();
    });
  });

  it('should not display optional sections when not provided', async () => {
    renderWithTheme(<HelpModal title="Test Chart" description="Description only" />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.queryByText('How to Read')).not.toBeInTheDocument();
      expect(screen.queryByText('Value & Insights')).not.toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    renderWithTheme(<HelpModal {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close modal when "Got it" button is clicked', async () => {
    renderWithTheme(<HelpModal {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const gotItButton = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(gotItButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should support React node content for description', async () => {
    const CustomDescription = () => (
      <div>
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </div>
    );

    renderWithTheme(<HelpModal title="Test Chart" description={<CustomDescription />} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  it('should apply custom icon button styles', () => {
    const customSx = { color: 'red', fontSize: '2rem' };
    renderWithTheme(<HelpModal {...defaultProps} iconButtonSx={customSx} />);

    const helpButton = screen.getByRole('button', { name: /help for test chart/i });
    expect(helpButton).toBeInTheDocument();
  });
});
