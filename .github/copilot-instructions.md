# CalOohPay Web - AI Agent Instructions

## Project Overview

CalOohPay automates out-of-hours (OOH) on-call compensation calculations for PagerDuty schedules. Built with Next.js 14 (App Router), TypeScript, Material-UI, and NextAuth.js. The core payment calculation logic uses the official [caloohpay npm package](https://www.npmjs.com/package/caloohpay).

**Current Branch**: `feat/multi-sched-payment-calculator` - Adding multi-schedule grid view for admin-level compensation reporting across multiple schedules. See [product-specs/multi-schedule-payment-calculation.md](product-specs/multi-schedule-payment-calculation.md) for feature requirements.

## Architecture & Key Patterns

### Dual Authentication System

- **Two authentication methods**: OAuth 2.0 and API Token (both via NextAuth.js)
- OAuth flow: Standard PagerDuty OAuth with JWT sessions
- API Token flow: Custom NextAuth credential provider that validates PagerDuty tokens directly
- **Critical**: Token management in [src/lib/auth/options.ts](src/lib/auth/options.ts) handles both flows - never mix token types
- Protected routes use Next.js middleware ([middleware.ts](middleware.ts))
- See [AUTHENTICATION.md](AUTHENTICATION.md) for full flow diagrams and security model

### Payment Calculation Architecture

- Uses official `caloohpay` npm package ([src/lib/caloohpay.ts](src/lib/caloohpay.ts))
- **DO NOT reimplement payment logic** - re-export from the package
- Rates: £50/weekday (Mon-Thu), £75/weekend (Fri-Sun) - defined in [src/lib/constants.ts](src/lib/constants.ts)
- Weekend = Friday-Sunday (not just Sat-Sun) for payment purposes
- Minimum 6 hours OOH to qualify for payment

### Path Aliases

- Use `@/*` for all src imports: `import { ROUTES } from '@/lib/constants'`
- Configured in [tsconfig.json](tsconfig.json) and [jest.config.ts](jest.config.ts)

### Component Organization

```
src/components/
├── auth/       # Authentication UI (login forms, OAuth buttons)
├── schedules/  # Schedule browsing and calendar views
│   ├── PaginationControls.tsx    # Memoized pagination buttons
│   ├── MonthNavigation.tsx       # Memoized month navigation
│   ├── ScheduleCard.tsx          # Reusable schedule card
│   └── ScheduleCard.styles.ts    # Styled components
├── payments/   # Payment calculation and export UI
├── ui/         # Reusable UI primitives
└── common/     # Shared layouts and navigation
    ├── Header.tsx              # Main header (composition)
    ├── Header.styles.ts        # Separated styles
    ├── Logo.tsx                # App logo and branding
    ├── NavigationLinks.tsx     # Auth-aware navigation
    ├── ThemeToggle.tsx         # Dark mode toggle
    ├── UserMenu.tsx            # User menu with settings/sign out
    ├── Footer.tsx              # App footer
    └── ErrorBoundary.tsx       # Error boundary
```

### Progressive Search Pattern

- **Instant local results**: Filter cached schedules client-side (0ms)
- **Parallel API search**: Query PagerDuty API simultaneously for comprehensive results
- **Smart merging**: Deduplicate by ID, combine local + API results
- **Visual feedback**: Show search state with chips ("Searching API...", "X local, Y from API")
- **State management**:
  - `searchQuery` - User input
  - `apiSearchQuery` - Triggers SWR API call
  - `allSchedules` - Accumulated cache for local filtering
  - `showingLocalResults` - True when local matches exist
  - `apiSearchComplete` - True when API returns
- See [docs/search-architecture.md](docs/search-architecture.md) for complete details

## Development Workflows

### Running the App

```bash
npm run dev              # Starts Next.js dev server on :3000
npm run build            # Production build (required before deploy)
npm run type-check       # TypeScript validation (no emit)
```

### Testing Strategy

- **Unit tests**: Jest + React Testing Library ([tests/unit/](tests/unit/))
  - Run: `npm test` or `npm run test:watch`
  - Coverage: `npm run test:coverage` (target >80%)
  - 226+ tests across 15+ test suites (96.5% unit, 3.5% E2E)
- **E2E tests**: Playwright with chromium, firefox, webkit ([tests/e2e/](tests/e2e/))
  - **Seeded tests** (authenticated): `npm run test:e2e:seeded` - Uses pre-seeded NextAuth JWT session
  - **Unauth tests**: `npm run test:e2e:unauth` - Tests unauthenticated flows
  - **Regular E2E**: `npm run test:e2e` - Standard E2E without session seeding
  - Debug: `npm run test:e2e:ui` or `npm run test:e2e:seeded:ui` (interactive mode)
  - Report: `npm run test:e2e:report` - View HTML test report
- **Test structure**: Mirror `src/` structure in `tests/unit/`
- Mock PagerDuty API calls in tests - never use real credentials
- **Seeded E2E pattern**: Uses `tests/e2e/.auth/seed.ts` to create JWT sessions for authenticated tests

### Code Quality

- **Pre-commit**: Husky runs `lint-staged` (auto-fixes linting/formatting)
- **Commit messages**: Enforced conventional commits via commitlint
  - Format: `type(scope): message` (e.g., `feat(auth): add API token support`)
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **ESLint**: `npm run lint:fix` for auto-fixes
- **Prettier**: `npm run format` (already runs in pre-commit)

## Critical Integration Points

### PagerDuty API Client

- Located in [src/lib/api/pagerduty.ts](src/lib/api/pagerduty.ts)
- Uses `@pagerduty/pdjs` SDK and Axios for custom calls
- **Always pass auth token**: Either from session (`session.accessToken`) or API token
- Rate limits: Respect PagerDuty's 960 req/min limit
- Error handling: Wrap in try-catch, check for 401 (re-auth), 429 (rate limit)

### Environment Variables

- OAuth: `NEXT_PUBLIC_PAGERDUTY_CLIENT_ID`, `PAGERDUTY_CLIENT_SECRET`
- NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- See [.env.example](.env.example) for full list
- **Client-side vars**: Must use `NEXT_PUBLIC_` prefix

### State Management

- **Global state**: Zustand for client state (lightweight Redux alternative)
- **Server state**: SWR for data fetching with automatic revalidation
- **Form state**: React Hook Form + Zod validation
- Avoid prop drilling - use Context/Zustand for shared state

## Project-Specific Conventions

### Date/Time Handling

- **Always use Luxon** ([src/lib/utils/scheduleUtils.ts](src/lib/utils/scheduleUtils.ts))
- PagerDuty returns ISO8601 strings - parse to Luxon DateTime
- Timezone-aware: Store schedules in original timezone, display in user's TZ
- Don't use native Date objects - Luxon handles DST and timezone shifts

### TypeScript Patterns

- Use `as const` for constant objects ([src/lib/constants.ts](src/lib/constants.ts))
- Type API responses explicitly ([src/lib/types/index.ts](src/lib/types/index.ts))
- Extend NextAuth types in [src/types/next-auth.d.ts](src/types/next-auth.d.ts)
- No `any` types - use `unknown` and narrow with type guards

### Material-UI Patterns

- Use `sx` prop for styling (not styled-components)
- Theme context: [src/context/ThemeContext.tsx](src/context/ThemeContext.tsx)
- Dark mode: Automatically switches based on system preference + manual toggle
- Responsive: Use MUI breakpoints (`theme.breakpoints.down('sm')`)

### CSV Export

- Located in [src/lib/utils/csvExport.ts](src/lib/utils/csvExport.ts)
- Format: Date, User, Schedule, Weekday Hours, Weekend Hours, Total Payment
- Compatible with Google Sheets and Excel

### Payment Calculations

- **Centralized Rate Management**: [src/lib/utils/ratesUtils.ts](src/lib/utils/ratesUtils.ts)
  - Use `getCurrentRates()` to get user-customized rates from settings store
  - Use `getDefaultRates()` for displaying default values in UI
  - Never hardcode payment rates or access PAYMENT_RATES directly in calculations
- **Calculator Integration**: Pass rates to OnCallPaymentsCalculator constructor
  ```typescript
  import { getCurrentRates } from '@/lib/utils/ratesUtils';
  const rates = getCurrentRates();
  const calculator = new OnCallPaymentsCalculator(rates.weekdayRate, rates.weekendRate);
  ```
- **Rate Customization**: Users can override default rates (£50/£75) in Settings page
- **Store Persistence**: Custom rates persist in localStorage across sessions

## Performance Patterns

### Memoization Strategy

- **Components**: Use `React.memo` for components with stable props
  - Schedule list page: PaginationControls, MonthNavigation
  - Schedule detail page: ScheduleHeader, ScheduleActions, OnCallSchedule
- **Callbacks**: Wrap handlers in `useCallback` with proper dependencies to prevent re-renders
- **Computed values**: Use `useMemo` for expensive calculations (filtering, sorting)
- **Grid layouts**: Use fixed heights to prevent layout shifts during state changes
- **Loading states**: Scope loading indicators to data sections only, keep UI chrome stable

### Search Optimization

- **Progressive loading**: Show cached results immediately, fetch API results in parallel
- **Deduplication**: Merge results by ID to avoid duplicates
- **State separation**: Keep `searchQuery` and `apiSearchQuery` separate for independent control
- **Cache accumulation**: Store all fetched schedules in `allSchedules` for instant local filtering

## Testing Gotchas

### Playwright Tests

- Tests run in parallel - avoid shared state
- Use `test.describe.serial()` for sequential tests
- Mock time with `page.clock.install()` for date-dependent tests
- CI runs single worker - local runs parallel
- **Seeded tests**: Use `npm run test:e2e:seeded` when testing authenticated flows
  - Session seed created in `tests/e2e/.auth/seed.ts`
  - Uses JWT strategy to bypass OAuth during tests
  - Seed scripts in `scripts/` directory (`e2e-seeded.sh`, `e2e-unauth.sh`)

### Jest Configuration

- Transform ES modules: `transformIgnorePatterns` includes `jose`, `openid-client`, `next-auth`
- Silent mode enabled - use `console.log` for debugging (will still show)
- Coverage excludes `*.d.ts`, `*.stories.*`, `__tests__/`
- Path aliases: `@/*` resolves to `src/*` (configured in [jest.config.ts](jest.config.ts))

## Common Tasks

### Adding a New API Endpoint

1. Create route in `src/app/api/[route]/route.ts`
2. Add endpoint to `API_ENDPOINTS` in [src/lib/constants.ts](src/lib/constants.ts)
3. Add client function in [src/lib/api/pagerduty.ts](src/lib/api/pagerduty.ts)
4. Write unit test in `tests/unit/lib/api/`

### Adding a New Page

1. Create `src/app/[route]/page.tsx` (uses App Router conventions)
2. Add route to `ROUTES` in [src/lib/constants.ts](src/lib/constants.ts)
3. Protect route: Add to `middleware.ts` matcher if auth required
4. Write E2E test in `tests/e2e/[route].spec.ts`

### Updating Payment Logic

- **DO NOT modify** - payment logic lives in `caloohpay` npm package
- To change rates/rules: Update the upstream package, then `npm update caloohpay`
- **User-customizable rates**: Retrieved via `getCurrentRates()` from [src/lib/utils/ratesUtils.ts](src/lib/utils/ratesUtils.ts)
- **Default rates**: Constants in [src/lib/constants.ts](src/lib/constants.ts) for display only
- **Adding calculations**: Always use `getCurrentRates()` and pass to OnCallPaymentsCalculator

## Current Feature Development

### Multi-Schedule Payment Calculation (feat/multi-sched-payment-calculator)

**Status**: In progress - See [product-specs/multi-schedule-payment-calculation.md](product-specs/multi-schedule-payment-calculation.md)

**Purpose**: Enable admins to view compensation reports across multiple schedules simultaneously in a spreadsheet-like grid view.

**Key Requirements**:

- Multi-select schedules from search interface
- Display compensation data in two-table format per schedule:
  1. Metadata table: Schedule name, URL, timezone
  2. Compensation table: Employee, Total, Weekdays, Weekends
- Handle overlapping schedules: If an employee is on-call for multiple schedules during same period, pay only once for total duration
- Month navigation for period selection (full month, beginning to end)
- Persistent schedule selection in localStorage
- Export grid data to clipboard for pasting into spreadsheets
- Performance: Support 100+ schedules without sluggishness

**Non-functional Requirements**:

- Use lightweight, fast grid library
- Smooth scrolling for large datasets
- Responsive grid layout

**Implementation Notes**:

- Route: `/schedules` with multi-select capability
- Component location: Likely `src/app/schedules/` or `src/components/schedules/`
- State management: Zustand store for selected schedules
- Data persistence: localStorage (future enhancement: DynamoDB)
- Export: Copy to clipboard initially (future: direct CSV download)

## Deployment

- **Planned platform**: AWS Amplify or Vercel
- **Build command**: `npm run build`
- **Environment variables**: Copy from [.env.example](.env.example) to hosting platform
- **Health check**: GET `/api/health` (should return 200)
- **Static assets**: `public/` directory served from root

## Documentation

- **Architecture**: [docs/architecture.md](docs/architecture.md) - system design, mermaid diagrams
- **Authentication**: [AUTHENTICATION.md](AUTHENTICATION.md) - OAuth flows, JWT details
- **Setup guides**: [docs/setup/](docs/setup/) - PagerDuty OAuth and API token setup
- **Quick start**: [QUICK_START.md](QUICK_START.md) - 5-minute setup guide
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - PR process, coding standards

## Key Files to Reference

- Constants: [src/lib/constants.ts](src/lib/constants.ts) - routes, endpoints, rates
- Types: [src/lib/types/index.ts](src/lib/types/index.ts) - API response types
- NextAuth config: [src/lib/auth/options.ts](src/lib/auth/options.ts) - auth providers
- Utils: [src/lib/utils/scheduleUtils.ts](src/lib/utils/scheduleUtils.ts) - date/time helpers

## Code Quality Gates (MANDATORY)

**Every code change must pass these quality gates before work is considered complete:**

### 1. **TypeScript Compilation** ✅

- **Command**: `npm run type-check`
- **Requirement**: ZERO TypeScript errors
- **When**: Run AFTER every file change or before committing
- **Failure Action**: Fix type errors immediately - do not proceed to tests until tsc passes
- **Common Issues**:
  - Missing type exports: `export interface` or `export type`
  - Incorrect imports: Use named imports for interfaces, not `default`
  - Generic type mismatches: Verify template arguments

### 2. **Test Suite** ✅

- **Command**: `npm test -- --testPathPatterns="<pattern>"`
- **Requirement**: ALL relevant tests passing (100%)
- **Timing**:
  1. Run tests for files you changed
  2. Run full store/hook/component tests for feature areas
  3. Run `npm test` for complete suite before final commit
- **Failure Action**: Fix failing tests before declaring task complete
- **Pattern Matching Examples**:
  - RateInput tests: `npm test -- --testPathPatterns=RateInput`
  - Store + Hook tests: `npm test -- --testPathPatterns="settingsStore|useSettings"`
  - All settings: `npm test -- --testPathPatterns="settings"`

### 3. **Test Rerun After Type Fixes**

- **Sequence**: TypeScript errors → Fix → Rerun tests
- **Why**: Type fixes sometimes require code reorganization that affects tests
- **Procedure**:
  ```bash
  npm run type-check      # Step 1: Check types
  # Fix any errors
  npm test -- --testPathPatterns=<file>  # Step 2: Rerun tests for affected file
  npm run type-check      # Step 3: Verify types still pass
  ```

### 4. **Coverage Tracking**

- **Target**: >80% coverage for new code
- **Command**: `npm run test:coverage`
- **Review**: Check `coverage/lcov-report/` for gaps
- **Exclude**: `.test.ts`, `.stories.tsx`, type definitions

### 4. **Full Test Suite Validation** ✅

- **Command**: `npm test` (run complete suite before committing)
- **Requirement**: Ensure ALL tests pass, not just new/modified tests
- **Why**: Refactored code can have unintended side effects on existing tests
- **When**:
  1. After all changes are complete
  2. Before committing code
  3. Before creating pull requests
- **Output Check**: Look for "Test Suites: X passed" and "Tests: X passed" with no failures

### 5. **Linting & Formatting**

- **Auto-run**: Pre-commit hooks handle `eslint` and `prettier`
- **Manual**: `npm run lint:fix` to fix style issues
- **Requirement**: No linting errors in changed files

### Quality Gate Checklist Template

When completing a task:

```
[ ] npm run type-check → 0 errors
[ ] npm test -- --testPathPatterns=<file> → all passing
[ ] npm test -- --testPathPatterns=<feature> → all passing (if multi-file)
[ ] npm test → complete suite passing (no broken existing tests)
[ ] npm run test:coverage → review coverage report
[ ] Manual review: No console.logs or debug code left
[ ] Commit message follows conventional commits
```

## Test-Driven Development (TDD) Approach

**This project follows pragmatic TDD practices focused on user behavior and real-world scenarios.**

### Core TDD Principles

1. **Test First**: Write tests BEFORE implementation
2. **User-Centric**: Test from the user's perspective, not implementation details
3. **Pragmatic Coverage**: Focus on critical behaviors, not exhaustive edge cases
4. **Pure Components**: Components receive data via props, emit changes via callbacks
5. **Separated Concerns**: Logic, styling, and presentation are separate
6. **Dependency Injection**: Mock at integration boundaries (API calls, external services)
7. **No Side Effects in Components**: Use hooks for side effects (fetching, routing, etc.)

### Pragmatic Testing Philosophy

**DO Test:**

- Core user workflows (login, form submission, navigation)
- Critical business logic (payment calculations, rate persistence)
- Accessibility fundamentals (labels, keyboard nav, heading hierarchy)
- Integration points (store updates, localStorage, API calls)
- Error states that users will encounter

**DON'T Test:**

- Implementation details (state variable names, function names)
- Library internals (React Hook Form validation, MUI rendering)
- Every possible edge case (focus on likely scenarios)
- Redundant behaviors already tested by child components
- Trivial rendering (if child component tests cover it, skip in parent)

### Component Structure Pattern

```
src/components/feature/
├── Component.tsx              # Pure component (minimal logic)
├── Component.test.tsx         # Unit tests (written first)
├── Component.styles.ts        # MUI sx objects (if needed)
├── Component.constants.ts     # Magic strings/numbers (if any)
└── index.ts                   # Barrel export
```

**Never mix styles into components**. Use separate `.styles.ts` files:

```typescript
// ❌ DON'T
export const MyComponent = () => (
  <Box sx={{ padding: 2, backgroundColor: '#fff' }}>
    Content
  </Box>
);

// ✅ DO
// MyComponent.styles.ts
export const containerStyles = {
  padding: 2,
  backgroundColor: '#fff',
};

// MyComponent.tsx
export const MyComponent = () => (
  <Box sx={containerStyles}>
    Content
  </Box>
);
```

### Testing Patterns

#### 1. **Unit Test Structure - Behavior Grouping**

```typescript
describe('ComponentName', () => {
  describe('Page Rendering', () => {
    // Core rendering: page loads, key elements present
  });

  describe('User Workflows', () => {
    // User actions: clicking, typing, form submission
  });

  describe('Accessibility', () => {
    // A11y essentials: labels, keyboard nav, headings
  });

  describe('Integration', () => {
    // Integration with hooks, stores, external systems
  });
});
```

#### 2. **Page Component Contract (Props)**

```typescript
// Always export prop types
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Make components accept callbacks, not handlers with side effects
// ✅ Good: receives onChange callback
// ❌ Bad: directly calls API or updates state
```

#### 3. **Hook Testing Pattern**

```typescript
// Test hooks in isolation, separate from components
import { renderHook, act } from '@testing-library/react';

describe('useSettings', () => {
  it('should return default settings on first call', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.weekdayRate).toBe(50);
  });

  it('should update when store changes', () => {
    const { result, rerender } = renderHook(() => useSettings());
    // Update store...
    rerender();
    expect(result.current.weekdayRate).toBe(60);
  });
});
```

#### 4. **Store Testing Pattern**

```typescript
// Keep stores pure - test synchronously
describe('settingsStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('should initialize with defaults', () => {
    const settings = getSettingsStore().getState();
    expect(settings.weekdayRate).toBe(50);
  });

  it('should persist to localStorage', () => {
    const store = getSettingsStore();
    act(() => store.setState({ weekdayRate: 60 }));
    expect(localStorage.getItem('settings')).toContain('60');
  });
});
```

### File Organization Rules

**For stores/state:**

```
src/lib/stores/
├── settingsStore.ts           # Pure store (no side effects)
├── __tests__/
│   └── settingsStore.test.ts  # Tests written first
└── index.ts                   # Barrel export
```

**For components:**

```
src/components/settings/
├── RateInput.tsx
├── RateInput.test.tsx         # Test the component interface
├── RateInput.styles.ts        # All styling here
└── index.ts
```

**For hooks:**

```
src/hooks/
├── useSettings.ts             # Hook logic only
├── __tests__/
│   └── useSettings.test.ts    # Test with renderHook
└── index.ts
```

### TDD Workflow for Features

1. **Define Types First**

   ```typescript
   // types/index.ts
   interface UserSettings {
     weekdayRate: number;
     weekendRate: number;
   }
   ```

2. **Write Pragmatic Integration Tests**

   ```typescript
   // app/settings/page.test.tsx
   describe('Page Rendering', () => {
     it('should render with form and heading', () => {
       render(<SettingsPage />);
       expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
       expect(screen.getByRole('spinbutton', { name: /weekday/i })).toBeInTheDocument();
     });
   });

   describe('User Workflows', () => {
     it('should persist changes to store on save', async () => {
       const user = userEvent.setup();
       render(<SettingsPage />);
       await user.type(screen.getByRole('spinbutton'), '60');
       await user.click(screen.getByRole('button', { name: /save/i }));
       expect(localStorage.getItem('settings')).toContain('60');
     });
   });
   ```

3. **Write Unit Tests for Critical Logic Only**

   ```typescript
   // lib/stores/__tests__/settingsStore.test.ts
   it('should persist to localStorage', () => {
     const store = getSettingsStore.getState();
     store.setWeekdayRate(60);
     expect(localStorage.getItem('settings')).toContain('60');
   });
   ```

4. **Implement Components**
   - Start with pure presentation components
   - Add logic only when tests demand it
   - Keep components under 150 lines

5. **Refactor for Clarity**
   - Extract constants
   - Extract helper functions
   - Improve naming based on test readability

### Key Testing Principles

- **Favor integration tests** over unit tests for page components (test the whole user workflow)
- **Test 1-2 representative workflows** instead of every button/input/edge case
- **Skip testing obvious rendering** (e.g., "should render a button" when the workflow test clicks it)
- **Group by user behavior** not by component internals (Page Rendering, User Workflows, Accessibility)

### Accessibility Testing

All components must include accessibility tests:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

describe('RateInput accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<RateInput label="Rate" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper label association', () => {
    const { getByText, getByRole } = render(<RateInput label="Weekday Rate" />);
    const input = getByRole('textbox');
    expect(getByText('Weekday Rate')).toHaveAttribute('for', input.id);
  });
});
```

### Common Pitfalls to Avoid

❌ **Don't:**

- Mix styles and component logic
- Use `screen.debug()` in tests (clean up after test execution)
- Mock `useRouter` in unit tests (test routing in E2E)
- Create components with side effects directly
- Test implementation details (test behavior instead)
- Skip testing error states and edge cases

✅ **Do:**

- Keep components small and focused (single responsibility)
- Test behavior and user interactions
- Use `render` + `userEvent` for component testing
- Mock at the integration boundary (API calls, stores)
- Write tests that would catch real bugs
- Test accessibility from the start
