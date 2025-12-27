# Contributing to CalOohPay Web

First off, thank you for considering contributing to CalOohPay Web! It's people like you that make this tool better for engineering teams everywhere.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- A PagerDuty account for testing (optional but recommended)

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/caloohpay-web.git
   cd caloohpay-web
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/caloohpay-web.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

   This will automatically install Playwright browsers via the postinstall script.

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables in `.env.local`

6. **Run the development server**

   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names with the following prefixes:

- `feature/` - New features (e.g., `feature/schedule-calendar-view`)
- `fix/` - Bug fixes (e.g., `fix/timezone-calculation`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/payment-calculator`)
- `test/` - Test additions or updates (e.g., `test/schedule-components`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise code
   - Follow the coding standards (see below)
   - Add or update tests as needed
   - Update documentation if necessary

3. **Test your changes**

   ```bash
   npm test                 # Run unit tests
   npm run test:e2e        # Run E2E tests
   npm run lint            # Check code style
   npm run format          # Format code
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add schedule calendar view"
   ```

   See [Commit Messages](#commit-messages) for guidelines.

5. **Keep your branch up to date**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

## 🎨 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types, avoid `any` when possible
- Use interfaces for object shapes
- Document complex types with JSDoc comments

### React Components

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript interfaces

Example:

```typescript
interface ScheduleCardProps {
  schedule: Schedule;
  onSelect: (scheduleId: string) => void;
  isSelected?: boolean;
}

export function ScheduleCard({ schedule, onSelect, isSelected = false }: ScheduleCardProps) {
  // Component implementation
}
```

### File Organization

- One component per file
- Co-locate tests with components (`ScheduleCard.tsx` and `ScheduleCard.test.tsx`)
- Group related components in directories
- Use index files for cleaner imports

### Naming Conventions

- **Components**: PascalCase (e.g., `ScheduleCalendar.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useScheduleData.ts`)
- **Utilities**: camelCase (e.g., `calculatePayment.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Schedule`, `PaymentRecord`)

### Code Style

- Use Prettier for formatting (configured in `.prettierrc`)
- Follow ESLint rules (configured in `eslint.config.mjs`)
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multiline objects/arrays

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(schedules): add monthly calendar view

Implement a monthly calendar view for schedules using Material UI components.
Includes timezone support and responsive design.

Closes #123
```

```bash
fix(payments): correct weekend day calculation

Fixed an issue where Friday was incorrectly categorized as a weekday
for payment calculation purposes.

Fixes #456
```

### Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests in the footer

## 🔀 Pull Request Process

### Before Submitting

1. ✅ Ensure all tests pass
2. ✅ Update documentation if needed
3. ✅ Add tests for new features
4. ✅ Run linting and formatting
5. ✅ Rebase on the latest main branch
6. ✅ Ensure commit messages follow conventions

### PR Template

When creating a PR, use this template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots or GIFs

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Aim for 80%+ code coverage
- Use descriptive test names

Example:

```typescript
describe('calculatePayment', () => {
  it('should calculate correct payment for weekday shifts', () => {
    const result = calculatePayment(weekdayShift);
    expect(result).toBe(50);
  });

  it('should calculate correct payment for weekend shifts', () => {
    const result = calculatePayment(weekendShift);
    expect(result).toBe(75);
  });
});
```

### Testing the Schedule Detail Page

The Schedule Detail Page (`src/app/schedules/[id]/`) is structured with modular components and hooks. When testing changes:

#### Test Custom Hooks

Located in `src/app/schedules/[id]/hooks/__tests__/`:

- Test state initialization
- Test state changes from callbacks
- Verify memoization with `renderHook` from `@testing-library/react`

Example:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDateRangeNavigation } from '../useDateRangeNavigation';

it('navigates to next month', () => {
  const { result } = renderHook(() => useDateRangeNavigation());

  act(() => {
    result.current.handleNextMonth();
  });

  expect(result.current.currentMonthDisplay).toBeTruthy();
});
```

#### Test Components

Located in `src/app/schedules/[id]/components/__tests__/`:

- Test with relevant props
- Verify rendering and user interactions
- Mock child components as needed

Example:

```typescript
import { render, screen } from '@testing-library/react';
import ScheduleHeader from '../ScheduleHeader';

it('renders schedule name', () => {
  render(
    <ScheduleHeader
      scheduleName="Engineering On-Call"
      timeZone="UTC"
      onBack={jest.fn()}
    />
  );

  expect(screen.getByText('Engineering On-Call')).toBeInTheDocument();
});
```

#### Test Data Fetchers

Located in `src/lib/api/__tests__/`:

- Test successful API responses
- Test error handling
- Mock `fetch` with `jest.fn()`
- Test authentication header handling

### Integration Tests

- Test component interactions
- Test API integrations
- Use React Testing Library

### E2E Tests

- Test critical user flows
- Use Playwright
- Focus on happy paths and edge cases

### Running Tests

```bash
npm test                    # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex logic
- Explain "why" not just "what"

Example:

```typescript
/**
 * Calculates out-of-hours payment for a given schedule period.
 *
 * Uses different rates for weekdays (Mon-Thu: £50) and weekends (Fri-Sun: £75).
 * A shift counts as OOH if it spans multiple days, extends past 17:30,
 * or is longer than 6 hours.
 *
 * @param schedule - The schedule period to calculate payment for
 * @param timezone - IANA timezone identifier (e.g., 'Europe/London')
 * @returns The calculated payment amount in GBP
 */
export function calculatePayment(schedule: Schedule, timezone: string): number {
  // Implementation
}
```

### Updating Documentation

When making changes that affect:

- **User behavior**: Update README.md
- **API endpoints**: Update docs/api.md
- **Architecture**: Update docs/architecture.md
- **Deployment**: Update docs/deployment.md

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

1. Check if the bug has already been reported
2. Ensure you're using the latest version
3. Collect information about the bug

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment**

- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

We welcome feature requests! Please provide:

1. Clear description of the feature
2. Use cases and benefits
3. Potential implementation approach
4. Any relevant examples or mockups

## ❓ Questions

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Open a new discussion in GitHub Discussions
4. Reach out to maintainers

## 🏆 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project README

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/caloohpay-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/caloohpay-web/discussions)

---

Thank you for contributing to CalOohPay Web! 🎉
