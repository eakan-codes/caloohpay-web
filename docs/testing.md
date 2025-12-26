# Testing Guide

## Overview

CalOohPay has comprehensive test coverage across unit, integration, and end-to-end tests. The test suite ensures code quality, prevents regressions, and validates the progressive search functionality.

## Test Statistics

- **Total Tests**: 122 passing (10 test suites)
- **Unit Tests**: 114 (93.4%)
- **E2E Tests**: 8 (6.6%)
- **Coverage Target**: >80%
- **Latest**: NextAuth route handler - 100% coverage (9 tests)

## Test Structure

```
tests/
├── unit/                           # Unit tests for components and utilities
│   └── components/
│       └── schedules/
│           ├── PaginationControls.test.tsx    # 17 tests
│           ├── MonthNavigation.test.tsx       # 19 tests
│           └── ScheduleCard.test.tsx          # 16 tests
├── integration/                    # Integration tests (future)
└── e2e/                           # End-to-end tests
    ├── auth.spec.ts               # Authentication flows
    ├── schedules.spec.ts          # Schedule browsing
    └── pagination-stability.spec.ts # 6 layout stability tests

src/app/schedules/__tests__/
└── page.test.tsx                  # 19 tests (includes 8 progressive search tests)

src/app/schedules/[id]/__tests__/
└── page.test.tsx                  # Schedule detail page tests

src/app/api/auth/[...nextauth]/__tests__/
└── route.test.ts                  # 9 tests (NextAuth route handler)

src/app/api/schedules/__tests__/
└── route.test.ts                  # API route tests
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- "path/to/test.tsx"

# Run tests matching pattern
npm test -- --testNamePattern="progressive search"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific browser
npm run test:e2e -- --project=chromium

# View test report
npm run test:e2e:report
```

## Progressive Search Test Coverage

### Unit Tests (8 tests in `src/app/schedules/__tests__/page.test.tsx`)

1. **should show local results immediately when searching**
   - Validates instant local cache filtering
   - Ensures 0ms latency for cached results

2. **should trigger API search while showing local results**
   - Confirms parallel API search execution
   - Tests simultaneous local + API search

3. **should show "Searching API..." indicator when search is in progress**
   - Tests loading state chip display
   - Validates user feedback during API calls

4. **should clear search state when search query is removed**
   - Ensures proper cleanup of search state
   - Tests return to normal pagination mode

5. **should reset page to 1 when searching**
   - Validates pagination reset on new search
   - Prevents showing empty pages

6. **should handle search with no local results**
   - Tests fallback when cache is empty
   - Validates API-only search path

7. **should deduplicate merged local and API results**
   - Confirms no duplicate schedules shown
   - Tests Map-based deduplication logic

8. **should handle rapid search query changes**
   - Tests resilience with fast typing
   - Ensures stable behavior during rapid state changes

### E2E Tests (6 tests in `tests/e2e/pagination-stability.spec.ts`)

1. **should maintain pagination controls position during navigation**
2. **should not show layout shift when changing pages**
3. **should maintain consistent card sizes across all pages**
4. **should handle empty pages gracefully**
5. **should maintain grid height consistency**
6. **should not cause button group re-render during navigation**

## Test Patterns

### Mocking SWR

```typescript
import useSWR from 'swr';

jest.mock('swr');
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

mockUseSWR.mockReturnValue({
  data: { schedules: mockData, total: 50 },
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: jest.fn(),
} as any);
```

### Mocking NextAuth

```typescript
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

mockUseSession.mockReturnValue({
  data: {
    user: { id: 'test-user', email: 'test@example.com' },
    accessToken: 'mock-token',
  },
  status: 'authenticated',
} as any);
```

### Testing Async Updates

```typescript
import { waitFor, screen } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText(/searching api/i)).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
import { fireEvent } from '@testing-library/react';

const searchInput = screen.getByPlaceholderText(/search schedules/i);
fireEvent.change(searchInput, { target: { value: 'engineering' } });
```

## Component Test Coverage

### PaginationControls (17 tests)

- ✅ Renders all navigation buttons
- ✅ Disables First/Previous on first page
- ✅ Disables Next/Last on last page
- ✅ Disables all buttons during loading
- ✅ Calls correct handlers on click
- ✅ Shows correct page numbers
- ✅ Re-renders only when props change (React.memo)

### MonthNavigation (19 tests)

- ✅ Renders month display and navigation buttons
- ✅ Formats month correctly
- ✅ Disables buttons during loading
- ✅ Calls navigation handlers
- ✅ Handles timezone correctly
- ✅ Re-renders only when props change (React.memo)

### ScheduleCard (16 tests)

- ✅ Renders schedule information
- ✅ Shows tooltip on hover
- ✅ Truncates long text
- ✅ Displays timezone chip
- ✅ Handles click events
- ✅ Accessible with aria-label

### Schedules Page (19 tests)

- ✅ Basic rendering and loading states
- ✅ Error handling
- ✅ Pagination functionality
- ✅ Schedule card interactions
- ✅ **Progressive search (8 tests)** ⭐

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test**: Focus on single behavior
3. **Use descriptive names**: Test name should explain what and why
4. **Mock external dependencies**: NextAuth, SWR, API calls
5. **Test user behavior**: Not implementation details
6. **Use Testing Library queries**: getByRole > getByLabelText > getByText

### Test Organization

```typescript
describe('Component Name', () => {
  describe('Feature Group', () => {
    it('should do specific thing', () => {
      // Test implementation
    });
  });
});
```

### Async Testing

```typescript
// ✅ Good: Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});

// ❌ Bad: Don't use setTimeout
setTimeout(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
}, 100);
```

### Query Priority

```typescript
// 1. Role (most accessible)
screen.getByRole('button', { name: /search/i });

// 2. Label
screen.getByLabelText(/search schedules/i);

// 3. Placeholder
screen.getByPlaceholderText(/search/i);

// 4. Text (last resort)
screen.getByText(/results/i);
```

## CI/CD Integration

### Pre-commit Hooks

```bash
# Run automatically before commit (via Husky)
npm run lint:fix        # Auto-fix linting errors
npm run format          # Format code with Prettier
```

### Commit Message Validation

```bash
# Enforced via commitlint
feat(search): add progressive search
test(schedules): add search tests
docs(readme): update search documentation
```

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Debugging Tests

### Jest Debug Mode

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### Playwright Debug Mode

```bash
# Run with headed browser
npm run test:e2e -- --headed

# Run with debug inspector
npm run test:e2e -- --debug
```

### Common Issues

#### Tests Timeout

```typescript
// Increase timeout for slow tests
it('should handle slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

#### Mock Not Working

```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

#### Element Not Found

```typescript
// Use screen.debug() to see DOM
screen.debug();

// Or debug specific element
screen.debug(screen.getByRole('button'));
```

## Coverage Reports

### Generate Report

```bash
npm run test:coverage
```

### View HTML Report

```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds

```json
{
  "coverageThresholds": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines
- [Architecture](./architecture.md) - System architecture
- [Search Architecture](./search-architecture.md) - Progressive search details
- [Styling Architecture](./styling-architecture.md) - Component styling patterns
