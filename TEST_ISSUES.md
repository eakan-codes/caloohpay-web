# Test Issues & Gaps

**This document has been consolidated into [docs/testing.md](docs/testing.md#known-test-issues--gaps).**

For comprehensive information on testing, including known issues, coverage gaps, and recommendations, please refer to the main [Testing Guide](docs/testing.md).

This file is maintained for historical reference. All future test-related documentation should be added to [docs/testing.md](docs/testing.md).

```typescript
describe('GET /api/schedules/[id]', () => {
  it('should return 401 when not authenticated');
  it('should return 404 when schedule not found');
  it('should fetch schedule with date range');
  it('should validate since/until query parameters');
  it('should use OAuth header format correctly');
  it('should use API Token header format correctly');
  it('should handle PagerDuty API errors');
  it('should handle network timeouts');
});
```

**Estimated Effort**: 3 hours

---

### 2. Zero Coverage - PagerDuty API Client

**File**: `src/lib/api/pagerduty.ts`  
**Coverage**: 0%  
**Lines**: 1-122

**Issue**: Core integration layer with PagerDuty API completely untested.

**Impact**:

- All API calls (getSchedule, listSchedules, validateToken) could fail
- Timeout handling (30s) unchecked
- Error parsing and status code handling untested
- Token validation logic unverified

**Suggested Fix**:
Create `src/lib/api/__tests__/pagerduty.test.ts`:

```typescript
describe('PagerDutyClient', () => {
  describe('constructor', () => {
    it('should create client with correct headers');
    it('should set 30s timeout');
  });

  describe('getSchedule', () => {
    it('should fetch schedule with date range');
    it('should handle timezone parameter correctly');
    it('should throw on 404');
  });

  describe('listSchedules', () => {
    it('should list schedules with query filter');
    it('should handle pagination (limit/offset)');
    it('should return schedules array');
  });

  describe('validateToken', () => {
    it('should validate token correctly');
    it('should handle 401 errors');
  });

  describe('error handling', () => {
    it('should handle network timeouts');
    it('should parse PagerDuty error messages');
    it('should handle rate limiting (429)');
  });
});
```

**Estimated Effort**: 4 hours

---

### 4. Zero Coverage - CSV Export Utilities

**File**: `src/lib/utils/csvExport.ts`  
**Coverage**: 0%  
**Lines**: 1-105

**Issue**: Payment export functionality untested - critical for user deliverables.

**Impact**:

- CSV corruption with special characters
- Excel incompatibility
- Quote/comma escaping failures
- Currency formatting errors (£ symbol)
- Filename sanitization issues

**Suggested Fix**:
Create `src/lib/utils/__tests__/csvExport.test.ts`:

```typescript
describe('CSV Export', () => {
  describe('escapeCsvValue', () => {
    it('should escape commas');
    it('should escape quotes with double quotes');
    it('should escape newlines');
    it('should handle special characters (£, unicode)');
    it('should wrap values with commas in quotes');
  });

  describe('generateCSV', () => {
    it('should generate valid CSV format');
    it('should include schedule metadata header');
    it('should format currency correctly (£50.00)');
    it('should include Date, User, Schedule columns');
    it('should calculate totals correctly');
  });

  describe('downloadCSV', () => {
    it('should create blob with correct MIME type');
    it('should trigger browser download');
    it('should use UTF-8 BOM for Excel compatibility');
  });

  describe('generateCSVFilename', () => {
    it('should sanitize schedule names (remove special chars)');
    it('should include ISO date format');
    it('should have .csv extension');
  });
});
```

**Estimated Effort**: 3 hours

---

### 5. Zero Coverage - Schedule Utilities

**File**: `src/lib/utils/scheduleUtils.ts`  
**Coverage**: 0%  
**Lines**: 1-123

**Issue**: Core payment calculation helpers untested.

**Impact**:

- Incorrect user aggregation from schedule entries
- Timezone bugs causing wrong payment periods
- Overlapping period errors
- Date filtering failures causing missing/extra payments

**Suggested Fix**:
Create `src/lib/utils/__tests__/scheduleUtils.test.ts`:

```typescript
describe('Schedule Utils', () => {
  describe('extractOnCallUsers', () => {
    it('should extract users from schedule entries');
    it('should handle timezone correctly (Luxon DateTime)');
    it('should consolidate periods per user');
    it('should parse ISO8601 dates correctly');
  });

  describe('mergeOnCallUsers', () => {
    it('should merge duplicate users from multiple schedules');
    it('should preserve all periods when merging');
    it('should maintain unique user IDs');
  });

  describe('filterScheduleEntriesByDateRange', () => {
    it('should include overlapping entries');
    it('should exclude entries outside range');
    it('should handle edge cases (exact boundaries)');
    it('should handle entries spanning boundaries');
  });

  describe('timezone handling', () => {
    it('should correctly convert between timezones');
    it('should handle DST transitions');
    it('should preserve original timezone in data');
  });
});
```

**Estimated Effort**: 4 hours

---

### 6. Missing JWT Callback Tests - API Token & Refresh

**File**: `src/lib/auth/__tests__/options.test.ts`  
**Lines**: Missing coverage for 35-41, 59-92, 121-132, 152-153, 159-162, 181-183, 192-229

**Issue**: JWT callback tests don't cover API token flow, refresh token logic, or token expiration scenarios.

**Impact**:

- API token authentication could fail
- Token refresh failures undetected
- Expiration handling broken
- Error states not tested

**Suggested Fix**:
Add to existing test file:

```typescript
describe('JWT Callback - API Token Flow', () => {
  it('should store API token in JWT on API token signin', async () => {
    const token = {
      /* oauth defaults */
    };
    const user = { id: '123', accessToken: 'api_token' };
    const account = { provider: 'credentials', authMethod: 'api-token' };

    const result = await authOptions.callbacks.jwt({ token, user, account });

    expect(result.accessToken).toBe('api_token');
    expect(result.authMethod).toBe('api-token');
    expect(result.expires_at).toBeUndefined(); // No expiry for API tokens
  });

  it('should set authMethod to "api-token" for credentials provider');
  it('should not set expires_at for API tokens');
});

describe('JWT Callback - Token Refresh', () => {
  it('should refresh token when expired', async () => {
    const expiredToken = {
      accessToken: 'old_token',
      refreshToken: 'refresh_token',
      expires_at: Date.now() / 1000 - 1000, // Expired 1000s ago
    };

    // Mock fetch for refresh
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_token',
        expires_in: 3600,
      }),
    });

    const result = await authOptions.callbacks.jwt({ token: expiredToken });

    expect(result.accessToken).toBe('new_token');
  });

  it('should set error when refresh fails', async () => {
    // Mock failed refresh
    const result = await authOptions.callbacks.jwt({
      token: {
        /* expired */
      },
    });

    expect(result.error).toBe('RefreshAccessTokenError');
  });

  it('should handle missing refresh_token gracefully');
});
```

**Estimated Effort**: 2 hours

---

## 🟠 HIGH PRIORITY

### 7. Zero Coverage - Login Page

**File**: `src/app/login/page.tsx`  
**Coverage**: 0%  
**Lines**: 1-291

**Issue**: Complex authentication UI with OAuth and API token tabs completely untested.

**Impact**:

- Tab switching broken
- Error messages not displayed
- Redirect logic fails
- Token validation skipped
- Loading states incorrect

**Suggested Fix**:
Create `src/app/login/__tests__/page.test.tsx`:

```typescript
describe('LoginPage', () => {
  it('should render OAuth tab by default');
  it('should switch to API token tab on click');
  it('should show error from URL params (OAuthCallback)');
  it('should disable Sign In button while loading');
  it('should redirect authenticated users to /schedules');
  it('should call signIn with OAuth provider when button clicked');
  it('should validate API token before submission');
  it('should show token error on invalid credentials');
  it('should handle Enter key in token input field');
  it('should show loading spinner during authentication');
});
```

**Estimated Effort**: 3 hours

---

### 8. Poor Test Isolation - Auth Tests Mock Global NextAuth

**File**: `src/lib/auth/__tests__/options.test.ts`

**Issue**: Tests directly call callbacks without proper mocking context. No isolation between OAuth and API token tests.

**Impact**:

- Tests could interfere with each other
- Real auth flows not properly simulated
- Flaky test failures

**Suggested Fix**:
Refactor to use helper functions:

```typescript
// Add test helper
function mockAuthContext(type: 'oauth' | 'api-token', overrides = {}) {
  const baseUser = { id: '123', email: 'test@example.com' };
  const baseAccount =
    type === 'oauth'
      ? { provider: 'pagerduty', access_token: 'oauth_token', expires_at: Date.now() + 3600 }
      : { provider: 'credentials', authMethod: 'api-token' };

  return {
    user: { ...baseUser, ...overrides.user },
    account: { ...baseAccount, ...overrides.account },
    token: { accessToken: 'test_token', ...overrides.token },
  };
}

// Use in tests
it('should handle OAuth flow', async () => {
  const context = mockAuthContext('oauth');
  const result = await authOptions.callbacks.jwt(context);
  // assertions
});
```

**Estimated Effort**: 2 hours

---

### 9. Incomplete Schedule Detail Page Tests

**File**: `src/app/schedules/[id]/__tests__/page.test.tsx`  
**Lines**: Missing coverage for 41-51, 83-88, 93-98, 112-177, 187-210, 277-285, 295-301

**Issue**: Only loading state tested, no tests for successful data fetch or error states.

**Impact**:

- Page could crash with real data
- Error handling broken
- Month navigation untested
- CSV export functionality untested

**Suggested Fix**:
Add to existing test file:

```typescript
describe('Data Loading', () => {
  it('should render schedule details when data loads', async () => {
    mockUseSWR.mockReturnValue({
      data: {
        schedule: mockScheduleData,
        entries: mockEntries,
      },
      error: undefined,
      isLoading: false,
    });

    render(<ScheduleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Schedule')).toBeInTheDocument();
      expect(screen.getByText(/America\/New_York/i)).toBeInTheDocument();
    });
  });

  it('should show error when schedule not found (404)', async () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: { status: 404, message: 'Schedule not found' },
      isLoading: false,
    });

    render(<ScheduleDetailPage />);

    expect(screen.getByText(/Schedule not found/i)).toBeInTheDocument();
  });

  it('should show error on network failure', async () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isLoading: false,
    });

    render(<ScheduleDetailPage />);

    expect(screen.getByText(/Failed to load schedule/i)).toBeInTheDocument();
  });
});

describe('Month Navigation', () => {
  it('should navigate to next month');
  it('should navigate to previous month');
  it('should update calendar when month changes');
});

describe('CSV Export', () => {
  it('should generate CSV on export button click');
  it('should include schedule name in filename');
  it('should show loading state during export');
});
```

**Estimated Effort**: 3 hours

---

### 10. Missing Edge Cases - Header Component

**File**: `src/components/common/__tests__/Header.test.tsx`  
**Lines**: Missing coverage for 43, 105, 113-117, 142

**Issue**: No tests for loading state, error states, or session expiration.

**Impact**:

- UI could break during auth transitions
- Incorrect state displayed
- Session expiration not handled

**Suggested Fix**:
Add to existing test file:

```typescript
describe('Session States', () => {
  it('should handle loading session state', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Header />);

    // Should show minimal UI without user-specific elements
    expect(screen.queryByText(/sign in/i)).toBeInTheDocument();
  });

  it('should show re-auth prompt when session expired', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { error: 'RefreshAccessTokenError' },
      status: 'authenticated',
    });

    render(<Header />);

    // Should show error state or redirect to login
    expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();
  });

  it('should handle missing user data gracefully', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: null },
      status: 'authenticated',
    });

    render(<Header />);

    // Should not crash
    expect(screen.getByText('CalOohPay')).toBeInTheDocument();
  });
});
```

**Estimated Effort**: 1 hour

---

### 11. Incomplete Coverage - Loading Component

**File**: `src/components/common/Loading.tsx`  
**Coverage**: 21.27%  
**Lines**: 11-47

**Issue**: Only basic rendering tested, no tests for fullScreen mode variations.

**Impact**:

- Layout shifts on different screen sizes
- Responsive breakpoints broken
- Incorrect spinner sizing

**Suggested Fix**:
Create `src/components/common/__tests__/Loading.test.tsx`:

```typescript
describe('Loading Component', () => {
  it('should render fullScreen mode with correct styles', () => {
    render(<Loading message="Loading..." fullScreen={true} />);

    const container = screen.getByTestId('loading');
    expect(container).toHaveAttribute('data-fullscreen', 'true');
    expect(container).toHaveStyle({ minHeight: '100vh' });
  });

  it('should render inline mode with padding', () => {
    render(<Loading message="Loading..." fullScreen={false} />);

    const container = screen.getByTestId('loading');
    expect(container).toHaveAttribute('data-fullscreen', 'false');
  });

  it('should adjust spinner size based on fullScreen prop', () => {
    const { rerender } = render(<Loading message="Loading..." fullScreen={true} />);

    let spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveStyle({ width: '80px' }); // Large spinner

    rerender(<Loading message="Loading..." fullScreen={false} />);

    spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveStyle({ width: '40px' }); // Small spinner
  });

  it('should have correct min-height for fullScreen mode');
  it('should center content vertically and horizontally');
});
```

**Estimated Effort**: 1 hour

---

### 12. Incomplete Coverage - ErrorBoundary

**File**: `src/components/common/ErrorBoundary.tsx`  
**Coverage**: 51.78%  
**Lines**: 19-21, 24-25, 28-32, 39-55

**Issue**: Missing tests for onError callback, custom fallback, and reset functionality.

**Impact**:

- Error reporting to monitoring systems could fail
- Custom error UIs not rendered
- Error recovery broken

**Suggested Fix**:
Create `src/components/common/__tests__/ErrorBoundary.test.tsx`:

```typescript
describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  it('should catch errors and render fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('should call onError callback with error info', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should render custom fallback when provided', () => {
    const fallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('should reset error state when handleReset called', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // Render without error
    rerender(
      <ErrorBoundary>
        <div>Success</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

**Estimated Effort**: 2 hours

---

### 13. All E2E Pagination Tests Skipped

**File**: `tests/e2e/pagination-stability.spec.ts`  
**Count**: 6 tests skipped

**Issue**: All visual regression tests for pagination skipped - no authentication mocking implemented.

**Impact**:

- Pagination layout shifts undetected
- Grid height instability not caught
- Card dimension inconsistencies missed
- Button movement during navigation unchecked

**Suggested Fix**:
Implement session mocking in beforeEach:

```typescript
test.beforeEach(async ({ page, context }) => {
  // Mock authenticated session cookie
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Mock API responses
  await page.route('**/api/schedules*', (route) => {
    const url = new URL(route.request().url());
    const offset = parseInt(url.searchParams.get('offset') || '0');

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        schedules: generateMockSchedules(16, offset),
        total: 50,
        limit: 16,
        offset,
        more: offset + 16 < 50,
      }),
    });
  });
});

// Then remove test.skip and enable all 6 tests
test.describe('Pagination Controls Stability', () => {
  test('pagination controls should not move when navigating between full pages', async ({
    page,
  }) => {
    // existing test code
  });
  // ... other tests
});
```

**Estimated Effort**: 2 hours

---

### 14. E2E Authenticated User Flow Tests Skipped

**File**: `tests/e2e/auth.spec.ts`  
**Count**: 6 tests skipped (lines 110-180)

**Issue**: Critical authenticated flow tests skipped - user menu, sign out, session persistence untested.

**Impact**:

- User menu interactions broken
- Sign out flow fails
- Session not persisted across navigation
- Avatar display issues

**Suggested Fix**:
Same as #13 - implement session cookie mocking:

```typescript
test.describe('Authenticated User Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock session endpoint
    await page.route('**/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
  });

  // Remove test.skip from all 6 tests
  test('should display user avatar when authenticated', async ({ page }) => {
    // existing test code
  });
  // ... other tests
});
```

**Estimated Effort**: 2 hours

---

## 🟡 MEDIUM PRIORITY

### 15. Missing Calendar View Integration Tests

**Impact**: Calendar rendering bugs, date picker issues, month boundary errors undetected.

**Suggested Fix**: Create `src/components/schedules/__tests__/ScheduleCalendar.test.tsx`

**Estimated Effort**: 3 hours

---

### 16. No Performance Tests for Large Datasets

**Impact**: Performance degradation, memory leaks with 1000+ schedules undetected.

**Suggested Fix**: Add performance test with 1500+ schedules measuring render time.

**Estimated Effort**: 2 hours

---

### 17. Missing Accessibility Tests

**Impact**: Keyboard navigation broken, tab order incorrect, screen reader support missing.

**Suggested Fix**: Add keyboard navigation tests (Tab, Enter, Space, Arrow keys) to PaginationControls and ScheduleCard.

**Estimated Effort**: 2 hours

---

### 18. Incomplete Card Component Coverage

**File**: `src/components/common/Card.tsx`  
**Coverage**: 63.63%  
**Lines**: 15-22

**Impact**: Optional props untested, actions section rendering unchecked.

**Suggested Fix**: Test title, subtitle, actions props in all combinations.

**Estimated Effort**: 1 hour

---

### 19. Missing API Negative Test Cases

**File**: `src/app/api/schedules/__tests__/route.test.ts`

**Impact**: Rate limiting (429), forbidden (403), service outage (503) not handled.

**Suggested Fix**: Add test cases for 429, 403, 503 status codes.

**Estimated Effort**: 1 hour

---

### 20. Weak Progressive Search Deduplication Test

**File**: `src/app/schedules/__tests__/page.test.tsx`  
**Lines**: ~440-450

**Impact**: Could deduplicate by name instead of ID, showing duplicate schedules.

**Suggested Fix**: Enhance test to verify deduplication uses ID, not name:

```typescript
it('should deduplicate by ID, not by name', async () => {
  const duplicateSchedule = {
    ...mockSchedules[0],
    name: 'Different Name', // Same ID, different name
  };

  mockUseSWR.mockReturnValue({
    data: { schedules: [mockSchedules[0], duplicateSchedule] },
  });

  render(<SchedulesPage />);

  await waitFor(() => {
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});
```

**Estimated Effort**: 30 minutes

---

### 21. No Timezone Handling Tests

**Impact**: DST transitions, international timezone bugs could break payment calculations.

**Suggested Fix**: Add timezone conversion tests, DST transition tests to scheduleUtils.test.ts.

**Estimated Effort**: 2 hours

---

### 22. Schedule Card Click Handler Verification

**File**: `tests/unit/components/schedules/ScheduleCard.test.tsx`

**Impact**: Doesn't verify correct schedule ID passed to onClick.

**Suggested Fix**: Enhance test to assert onClick receives specific schedule ID:

```typescript
it('should pass correct schedule ID to onClick', async () => {
  const onClick = jest.fn();
  render(<ScheduleCard schedule={mockSchedule} onClick={onClick} />);

  await user.click(screen.getByRole('article'));

  expect(onClick).toHaveBeenCalledWith('test-schedule-1');
});
```

**Estimated Effort**: 15 minutes

---

## 🟢 LOW PRIORITY

### 23. Duplicate Mock Setup Across Files

**Impact**: Maintenance burden - mock changes require updating 10+ files.

**Suggested Fix**: Create `tests/unit/setupTests.ts` with shared mocks.

**Estimated Effort**: 1 hour

---

### 24. Footer Link Tests Incomplete

**File**: `src/components/common/__tests__/Footer.test.tsx`

**Impact**: Link could open in same tab, losing user's work.

**Suggested Fix**: Verify `target="_blank"` and `rel="noopener noreferrer"` attributes.

**Estimated Effort**: 15 minutes

---

### 25. MonthNavigation Icon Verification Missing

**File**: `tests/unit/components/schedules/MonthNavigation.test.tsx`

**Impact**: Wrong icons could be displayed, confusing users.

**Suggested Fix**: Verify ChevronLeft, ChevronRight, CalendarMonth icons by test ID.

**Estimated Effort**: 15 minutes

---

### 26. Console Error Filtering Incomplete

**File**: `tests/e2e/console.spec.ts`

**Impact**: React dev warnings (act warnings) cause false test failures.

**Suggested Fix**: Enhance filter to exclude React development warnings.

**Estimated Effort**: 30 minutes

---

### 27. Excessive Re-renders in Tests

**Impact**: Test suite runtime increases as more tests added.

**Suggested Fix**: Use waitFor with reduced polling interval (100ms instead of 50ms default).

**Estimated Effort**: 30 minutes

---

### 28. Missing Dark Mode Persistence Test

**File**: `tests/e2e/console.spec.ts`

**Impact**: Users lose theme preference on page reload.

**Suggested Fix**: Add E2E test verifying theme persists across page reload.

**Estimated Effort**: 30 minutes

---

## Summary Statistics

| Priority     | Count  | Estimated Hours | Key Areas                                                  |
| ------------ | ------ | --------------- | ---------------------------------------------------------- |
| **CRITICAL** | 6      | 17 hours        | API routes, PagerDuty client, CSV export, auth callbacks   |
| **HIGH**     | 8      | 18 hours        | Login page, test isolation, E2E auth, loading/error states |
| **MEDIUM**   | 10     | 16 hours        | Calendar view, performance, accessibility, timezone        |
| **LOW**      | 4      | 3 hours         | Test organization, minor improvements                      |
| **TOTAL**    | **28** | **54 hours**    | ~1,400 LOC to write                                        |

---

## Current Coverage by File

```
File                              | Coverage | Priority to Fix
----------------------------------|----------|----------------
src/app/api/auth/[...nextauth]    | 0%       | CRITICAL
src/app/api/schedules/[id]        | 0%       | CRITICAL
src/lib/api/pagerduty.ts          | 0%       | CRITICAL
src/lib/utils/csvExport.ts        | 0%       | CRITICAL
src/lib/utils/scheduleUtils.ts    | 0%       | CRITICAL
src/app/login/page.tsx            | 0%       | HIGH
src/components/common/Loading.tsx | 21%      | HIGH
src/components/common/ErrorBoundary.tsx | 51% | HIGH
src/components/common/Card.tsx    | 63%      | MEDIUM
src/lib/auth/options.ts           | 56%      | CRITICAL/HIGH
src/components/common/Header.tsx  | 100%*    | HIGH (edge cases)
src/app/schedules/page.tsx        | 89%      | MEDIUM (gaps)
src/app/schedules/[id]/page.tsx   | 72%      | HIGH (major gaps)
```

\*100% line coverage but missing edge case tests

---

## Recommended Sprint Plan

### Sprint 1 (Week 1) - Critical API & Core Utils

- [ ] #1: NextAuth route tests
- [ ] #2: Schedule [id] route tests
- [ ] #3: PagerDuty client tests
- [ ] #4: CSV export tests
- [ ] #5: Schedule utils tests

**Goal**: 0% → 90% coverage for core API and utilities

---

### Sprint 2 (Week 2) - Auth & E2E

- [ ] #6: JWT callback tests (API token + refresh)
- [ ] #7: Login page tests
- [ ] #8: Refactor auth test isolation
- [ ] #13: Enable E2E pagination tests
- [ ] #14: Enable E2E authenticated flow tests

**Goal**: Complete auth test coverage, enable all E2E tests

---

### Sprint 3 (Week 3) - Components & Edge Cases

- [ ] #9: Schedule detail page tests
- [ ] #10: Header edge case tests
- [ ] #11: Loading component tests
- [ ] #12: ErrorBoundary tests
- [ ] #18: Card component tests

**Goal**: 100% component coverage with edge cases

---

### Sprint 4 (Week 4) - Quality & Performance

- [ ] #15: Calendar view tests
- [ ] #16: Performance tests
- [ ] #17: Accessibility tests
- [ ] #19-22: Medium priority gaps
- [ ] #23-28: Low priority improvements

**Goal**: Achieve 85%+ overall coverage, performance baseline

---

## Notes

- Current test count: **113 passing**
- Target test count: **~200-250 tests**
- Gap: **~90-140 tests to write**
- Estimated total effort: **54 hours (~7 work days)**

**Test Quality Improvements Made**:

- ✅ Fixed duplicate tests in route.test.ts (parameterized tests)
- ✅ Fixed misleading test names in page.test.tsx
- ✅ Removed redundant elevation test from Header.test.tsx
- ✅ Fixed E2E timeout issues (redirect URL matching)
- ✅ Documented skipped E2E tests (auth-dependent)
