import { render, screen, fireEvent } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
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

  it('should render the CalOohPay logo', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);
    expect(screen.getByText('CalOohPay')).toBeInTheDocument();
  });

  it('should show Schedules link when authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<Header />);
    expect(screen.getByText('Schedules')).toBeInTheDocument();
  });

  it('should not show Schedules link when not authenticated', () => {
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
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

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

  it('should have correct elevation prop', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { container } = render(<Header elevation={4} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
