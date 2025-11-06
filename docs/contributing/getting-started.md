# Getting Started - Contributor Guide

Welcome to CaloohPay! This guide will help you set up your development environment and become an effective contributor to the project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style and Conventions](#code-style-and-conventions)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js**: v20.x or later (LTS recommended)

  ```bash
  node --version  # Should output v20.x.x or higher
  ```

- **npm**: v10.x or later (comes with Node.js)

  ```bash
  npm --version
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```

### Optional but Recommended

- **VS Code**: Recommended editor with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitLens
  - Error Lens

- **GitHub CLI** (optional): For easier PR management
  ```bash
  gh --version
  ```

### PagerDuty Account

You'll need access to a PagerDuty account to test the application. See the [PagerDuty OAuth Setup Guide](../setup/pagerduty-oauth-setup.md) for details.

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/caloohpay-web.git
cd caloohpay-web
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages, including:

- Next.js 14 (React framework)
- NextAuth.js v5 (Authentication)
- Tailwind CSS (Styling)
- Luxon (Date/time handling)
- Testing libraries (Jest, Playwright)

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# PagerDuty OAuth
PAGERDUTY_CLIENT_ID=<your_pagerduty_client_id>
PAGERDUTY_CLIENT_SECRET=<your_pagerduty_client_secret>

# Optional: API Configuration
PAGERDUTY_API_BASE=https://api.pagerduty.com

# Optional: Development
NODE_ENV=development
```

#### How to Generate NEXTAUTH_SECRET

Run this command:

```bash
openssl rand -base64 32
```

Copy the output into your `.env.local` file.

#### Getting PagerDuty Credentials

Follow the [PagerDuty OAuth Setup Guide](../setup/pagerduty-oauth-setup.md) to create an OAuth application and obtain your Client ID and Secret.

### 4. Verify Setup

```bash
npm run lint    # Should pass with no errors
npm run build   # Should build successfully
npm test        # Should run all unit tests (22 tests)
```

## Project Structure

```
caloohpay-web/
├── .docs/                     # 📚 Documentation
│   ├── setup/                 # Setup guides
│   ├── configuration/         # Configuration docs
│   └── contributing/          # Contributor guides
├── src/
│   ├── app/                   # 🎯 Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   └── schedules/    # PagerDuty schedule APIs
│   │   ├── schedules/        # Schedule pages
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # ⚛️ React components
│   │   └── common/          # Shared UI components
│   ├── context/              # React Context providers
│   ├── lib/                  # 🔧 Utility code
│   │   ├── auth/            # NextAuth configuration
│   │   ├── api/             # API client utilities
│   │   ├── calculations/    # Payment calculation logic
│   │   └── utils/           # General utilities
│   ├── styles/               # 🎨 Global styles & theme
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware
├── tests/
│   └── e2e/                  # Playwright E2E tests
├── public/                   # Static assets
├── .husky/                   # Git hooks
├── jest.config.ts            # Jest configuration
├── playwright.config.ts      # Playwright configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Project dependencies
```

### Key Directories

- **`src/app/`**: Next.js 14 App Router pages and API routes
- **`src/components/`**: Reusable React components
- **`src/lib/`**: Business logic, calculations, and utilities
- **`tests/e2e/`**: End-to-end tests with Playwright
- **`.docs/`**: Comprehensive project documentation

## Running the Application

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

Build and run a production-optimized version:

```bash
npm run build
npm start
```

### Development Features

- **Hot Reload**: Changes are reflected immediately
- **Fast Refresh**: React components update without losing state
- **TypeScript**: Type-checking in real-time
- **ESLint**: Linting errors shown in terminal

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### 2. Make Your Changes

Edit code, add tests, update documentation.

### 3. Run Quality Checks

```bash
# Lint and format
npm run lint
npm run format

# Run tests
npm test
npm run test:e2e  # E2E tests (requires running app)

# Type-check
npm run type-check  # If configured
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add payment export feature"
```

See [Commit Guidelines](#commit-guidelines) for details.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub.

## Testing

### Unit Tests (Jest)

Run all unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with coverage:

```bash
npm test -- --coverage
```

### Test Structure

```typescript
// src/lib/calculations/__tests__/PaymentCalculator.test.ts
import { PaymentCalculator } from '../PaymentCalculator';

describe('PaymentCalculator', () => {
  it('should calculate weekday payment correctly', () => {
    const calculator = new PaymentCalculator();
    const payment = calculator.calculateWeekdayPayment(8);
    expect(payment).toBe(200); // 8 hours * $25/hour
  });
});
```

### End-to-End Tests (Playwright)

Run E2E tests:

```bash
npm run test:e2e
```

Run in UI mode for debugging:

```bash
npx playwright test --ui
```

### Test Coverage

Current test coverage:

- **Unit Tests**: 22 tests covering:
  - Authentication (14 tests)
  - API routes (8 tests)
- **E2E Tests**: Authentication and schedule flows

**Goal**: Maintain >80% code coverage for critical paths.

## Code Style and Conventions

### TypeScript

- Use TypeScript for all new code
- Define interfaces for complex objects
- Avoid `any` type unless absolutely necessary
- Use type inference where obvious

```typescript
// Good
interface Schedule {
  id: string;
  name: string;
  timezone: string;
}

// Avoid
const schedule: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use Server Components by default (Next.js 14)

```typescript
// Server Component (default)
export default async function SchedulesPage() {
  const schedules = await fetchSchedules();
  return <ScheduleList schedules={schedules} />;
}

// Client Component (when needed)
'use client';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Styling

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Follow mobile-first responsive design

```typescript
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <Card className="bg-white shadow-md">
    <h2 className="text-xl font-semibold">Title</h2>
  </Card>
</div>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ScheduleCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `scheduleUtils.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Types: `types.ts` or `index.ts` in types directory

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(schedules): add schedule detail page with monthly view

- Implement monthly navigation
- Group on-call periods by user
- Calculate total hours per user
- Add link from schedule list to detail

Closes #123
```

```bash
fix(auth): handle token refresh errors gracefully

Previously, token refresh errors would crash the app.
Now we catch errors and prompt user to sign in again.

Fixes #456
```

### Commit Hooks

Husky pre-commit hooks automatically:

- Run ESLint on staged files
- Format code with Prettier
- Run commitlint to validate commit messages

## Pull Request Process

### 1. Create PR

- Use descriptive PR title (follows commit convention)
- Fill out the PR template
- Link related issues
- Add screenshots for UI changes

### 2. PR Checklist

Before requesting review, ensure:

- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] E2E tests pass if applicable
- [ ] Documentation updated if needed
- [ ] No console errors in browser
- [ ] Mobile responsive (if UI changes)

### 3. Code Review

- Address reviewer feedback promptly
- Push additional commits to same branch
- Request re-review when ready
- Keep PR scope focused (smaller is better)

### 4. Merge

Once approved:

- Squash commits (if multiple small commits)
- Ensure CI/CD passes
- Merge to `main` branch
- Delete feature branch after merge

## Common Tasks

### Adding a New Page

1. Create page component in `src/app/[route]/page.tsx`
2. Add route protection in `src/middleware.ts` if needed
3. Update navigation in `src/components/common/Header.tsx`

### Creating an API Route

1. Create route handler in `src/app/api/[route]/route.ts`
2. Add authentication check using `getServerSession`
3. Add tests in `__tests__/route.test.ts`

### Adding a Component

1. Create component in `src/components/[category]/`
2. Export from `index.ts` for easier imports
3. Add Storybook story if complex (optional)

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update to latest (use caution)
npx npm-check-updates -u
npm install
```

## Troubleshooting

### "Module not found" Errors

**Solution**: Clear Next.js cache and reinstall:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Port 3000 Already in Use

**Solution**: Kill the process or use different port:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors After Update

**Solution**: Restart TypeScript server in VS Code:

1. Open Command Palette (Cmd+Shift+P)
2. Run "TypeScript: Restart TS Server"

### Environment Variables Not Loading

**Solution**:

1. Verify `.env.local` exists in project root
2. Restart development server
3. Ensure variables don't have quotes or extra spaces

### Tests Failing Locally

**Solution**:

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in band (serial)
npm test -- --runInBand

# Update snapshots if needed
npm test -- --updateSnapshot
```

## Getting Help

### Resources

- **Documentation**: Check `.docs/` directory first
- **README**: Main project README
- **AUTHENTICATION**: OAuth flow diagram
- **CONTRIBUTING**: This guide and code of conduct

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **Pull Request Comments**: Code-specific questions

### Asking Questions

When asking for help, include:

1. What you're trying to do
2. What you expected to happen
3. What actually happened
4. Steps to reproduce
5. Relevant error messages (full stack trace)
6. Environment details (Node version, OS)

## Next Steps

Now that you're set up:

1. ✅ Run the application locally
2. ✅ Explore the codebase
3. ✅ Pick an issue labeled "good first issue"
4. ✅ Read [NextAuth Configuration](../configuration/nextauth-setup.md)
5. ✅ Review existing PRs to understand code review process

Welcome to the team! 🎉

## Additional Documentation

- [PagerDuty OAuth Setup](../setup/pagerduty-oauth-setup.md)
- [NextAuth Configuration](../configuration/nextauth-setup.md)
- [Authentication Flow](../../AUTHENTICATION.md)
- [Project Plan](../../PROJECT_PLAN.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)
