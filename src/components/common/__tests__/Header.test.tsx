import { render, screen, fireEvent } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
import { makeSession, mockUseSession } from '@/tests/utils';
import { Header } from '../Header';
import { useThemeMode } from '@/context/ThemeContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock ThemeContext
jest.mock('@/context/ThemeContext', () => ({
  useThemeMode: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Header', () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeMode as jest.Mock).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  // Cleanup handled globally in jest.setup.ts

  it('should render the CalOohPay logo', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);
    expect(screen.getByText('CalOohPay')).toBeInTheDocument();
  });

  it('should show Schedules link when authenticated', () => {
    mockUseSession(makeSession());

    render(<Header />);
    expect(screen.getByText('Schedules')).toBeInTheDocument();
  });

  it('should show Settings in user menu when authenticated', () => {
    mockUseSession(makeSession());

    render(<Header />);

    // Open the user menu
    const accountButton = screen.getByLabelText(/account menu/i);
    fireEvent.click(accountButton);

    // Settings should be in the dropdown menu as a link
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('should not show Schedules when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);
    expect(screen.queryByText('Schedules')).not.toBeInTheDocument();
  });

  it('should toggle theme when dark mode button is clicked', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);
    const themeButton = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeButton);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should show user menu when authenticated', () => {
    const session = makeSession({
      user: { id: 'test-user-1', name: 'Test User', email: 'test@example.com', image: null },
    });
    mockUseSession(session);

    render(<Header />);

    // Avatar should be visible
    const avatar = screen.getByText('T'); // First letter of Test User
    expect(avatar).toBeInTheDocument();
  });

  it('should call signOut when Sign Out is clicked', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<Header />);

    // Open user menu
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);

    // Click Sign Out
    const signOutButton = await screen.findByText(/sign out/i);
    fireEvent.click(signOutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  // Note: Elevation prop test removed as redundant - component rendering
  // is already verified by other tests, and elevation is a MUI internal prop
});
