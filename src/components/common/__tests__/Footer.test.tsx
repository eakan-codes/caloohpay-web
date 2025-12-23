import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock Next.js Link
jest.mock('next/link', () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer', () => {
  it('should render the CalOohPay title', () => {
    render(<Footer />);
    expect(screen.getByText(/CalOohPay/i)).toBeInTheDocument();
  });

  it('should render the copyright text with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
  });

  it('should render version number', () => {
    render(<Footer />);
    expect(screen.getByText(/v0\.1\.0/i)).toBeInTheDocument();
  });

  it('should render Source Code link to GitHub', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: /source code/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href');
  });

  it('should have proper semantic structure', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should render GitHub icon', () => {
    render(<Footer />);
    const githubIcon = screen.getByTestId('GitHubIcon');
    expect(githubIcon).toBeInTheDocument();
  });
});
