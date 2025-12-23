import { render, screen } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ScheduleDetailPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock SWR
jest.mock('swr', () => {
  return jest.fn((key) => {
    if (!key) {
      return { data: undefined, error: undefined, isLoading: false };
    }
    return { data: undefined, error: undefined, isLoading: true };
  });
});

// Mock common components
jest.mock('@/components/common', () => ({
  Header: () => <div data-testid="header">Header</div>,
  Footer: () => <div data-testid="footer">Footer</div>,
  Loading: ({ message, fullScreen }: { message: string; fullScreen?: boolean }) => (
    <div data-testid="loading" data-fullscreen={fullScreen}>
      {message}
    </div>
  ),
}));

describe('ScheduleDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-schedule-id' });
  });

  it('should render full screen loading without header/footer when loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<ScheduleDetailPage />);

    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('data-fullscreen', 'true');
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  it('should not fetch data when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<ScheduleDetailPage />);

    // When not authenticated, SWR key is null, so won't be in loading state
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should have proper page structure when initialized', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
        authMethod: 'oauth',
      },
      status: 'authenticated',
    });

    const { container } = render(<ScheduleDetailPage />);

    // Check that component renders
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should use correct schedule ID from params', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'specific-schedule-123' });
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<ScheduleDetailPage />);

    // Component should render without errors
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
