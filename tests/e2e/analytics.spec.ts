import { test, expect } from '@playwright/test';

/**
 * E2E tests for Analytics Page
 *
 * Tests cover:
 * - Analytics page navigation from schedule detail
 * - Tab interface functionality (Rhythm View, Frequency Matrix, Burden Distribution, Interruption vs Pay)
 * - Date range picker with validation
 * - Data loading states
 * - Visualization rendering
 * - Help modal interactions
 * - Console error checking
 */

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

test.describe('Analytics Page E2E Tests', () => {
  // Skip when session is not seeded, since protected routes will redirect
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test.beforeEach(async ({ page }) => {
    // Mock authentication session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user',
            email: 'test@example.com',
            name: 'Test User',
          },
          accessToken: 'mock-token',
          authMethod: 'oauth',
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    // Mock schedule detail API
    await page.route('**/api/schedules/SCHED123', async (route) => {
      const url = new URL(route.request().url());
      const since = url.searchParams.get('since');
      const until = url.searchParams.get('until');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedule: {
            id: 'SCHED123',
            name: 'Test Analytics Schedule',
            description: 'Test schedule for analytics',
            time_zone: 'America/New_York',
            html_url: 'https://example.pagerduty.com/schedules/SCHED123',
          },
        }),
      });
    });

    // Mock analytics oncalls API with sample data
    await page.route('**/api/analytics/oncalls**', async (route) => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          oncalls: [
            {
              user: { id: 'USER1', summary: 'Alice Smith', name: 'Alice Smith' },
              schedule: {
                id: 'SCHED123',
                summary: 'Test Schedule',
                html_url: 'https://example.pagerduty.com/schedules/SCHED123',
              },
              start: threeWeeksAgo.toISOString(),
              end: new Date(threeWeeksAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              user: { id: 'USER2', summary: 'Bob Jones', name: 'Bob Jones' },
              schedule: {
                id: 'SCHED123',
                summary: 'Test Schedule',
                html_url: 'https://example.pagerduty.com/schedules/SCHED123',
              },
              start: twoWeeksAgo.toISOString(),
              end: new Date(twoWeeksAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              user: { id: 'USER1', summary: 'Alice Smith', name: 'Alice Smith' },
              schedule: {
                id: 'SCHED123',
                summary: 'Test Schedule',
                html_url: 'https://example.pagerduty.com/schedules/SCHED123',
              },
              start: oneWeekAgo.toISOString(),
              end: now.toISOString(),
            },
          ],
        }),
      });
    });

    // Mock analytics incidents API
    await page.route('**/api/analytics/incidents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          incidents: [
            {
              id: 'INC1',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              status: 'resolved',
              assignments: [{ assignee: { id: 'USER1' } }],
            },
          ],
        }),
      });
    });
  });

  test('should load analytics page and display default Rhythm View tab', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.getByRole('heading', { name: /analytics dashboard/i })).toBeVisible();
    await expect(page.getByText('Test Analytics Schedule')).toBeVisible();

    // Check that tabs are visible
    await expect(page.getByRole('tab', { name: /rhythm view/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /frequency matrix/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /burden distribution/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /interruption vs pay/i })).toBeVisible();

    // Rhythm View should be selected by default
    await expect(page.getByRole('tab', { name: /rhythm view/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Check that Rhythm View content is visible
    await expect(page.getByRole('heading', { name: /rhythm view/i, level: 6 })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Click on Frequency Matrix tab
    await page.getByRole('tab', { name: /frequency matrix/i }).click();
    await expect(page.getByRole('heading', { name: /frequency matrix/i, level: 6 })).toBeVisible();
    await expect(page.getByRole('tab', { name: /frequency matrix/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Click on Burden Distribution tab
    await page.getByRole('tab', { name: /burden distribution/i }).click();
    await expect(
      page.getByRole('heading', { name: /burden distribution/i, level: 6 })
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: /burden distribution/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Click on Interruption vs Pay tab
    await page.getByRole('tab', { name: /interruption vs pay/i }).click();
    await expect(page.getByRole('heading', { name: /interruption.*pay/i, level: 6 })).toBeVisible();
    await expect(page.getByRole('tab', { name: /interruption vs pay/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Go back to Rhythm View
    await page.getByRole('tab', { name: /rhythm view/i }).click();
    await expect(page.getByRole('heading', { name: /rhythm view/i, level: 6 })).toBeVisible();
    await expect(page.getByRole('tab', { name: /rhythm view/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('should display help modal for each visualization', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Test Rhythm View help modal
    const rhythmHelpButton = page.getByRole('button', { name: /help for rhythm view/i });
    await expect(rhythmHelpButton).toBeVisible();
    await rhythmHelpButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/visualizes the cadence and rhythm/i)).toBeVisible();
    await page.getByRole('button', { name: /got it/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Test Frequency Matrix help modal
    await page.getByRole('tab', { name: /frequency matrix/i }).click();
    const frequencyHelpButton = page.getByRole('button', { name: /help for frequency matrix/i });
    await expect(frequencyHelpButton).toBeVisible();
    await frequencyHelpButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Test Burden Distribution help modal
    await page.getByRole('tab', { name: /burden distribution/i }).click();
    const burdenHelpButton = page.getByRole('button', { name: /help for burden distribution/i });
    await expect(burdenHelpButton).toBeVisible();
    await burdenHelpButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /got it/i }).click();

    // Test Interruption vs Pay help modal
    await page.getByRole('tab', { name: /interruption vs pay/i }).click();
    const interruptionHelpButton = page.getByRole('button', {
      name: /help for interruption.*pay/i,
    });
    await expect(interruptionHelpButton).toBeVisible();
    await interruptionHelpButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /got it/i }).click();
  });

  test('should display date range and allow custom selection', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Check that date range is displayed
    const dateRangeText = page.locator('text=/\\w+ \\d+, \\d{4} - \\w+ \\d+, \\d{4}/');
    await expect(dateRangeText).toBeVisible();

    // Click custom date range button
    await page.getByRole('button', { name: /custom date range/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/select date range/i)).toBeVisible();

    // Check for quick select buttons
    await expect(page.getByRole('button', { name: /last month/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /last 3 months/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /last 6 months/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /last year/i })).toBeVisible();

    // Check for constraint information
    await expect(page.getByText(/maximum range: 1 year/i)).toBeVisible();
    await expect(page.getByText(/cannot go back more than 2 years/i)).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate back to schedule detail page', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Click back button
    await page.getByRole('button', { name: /back to schedule/i }).click();

    // Should navigate to schedule detail page
    await expect(page).toHaveURL('/schedules/SCHED123');
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Check refresh button exists
    const refreshButton = page.getByRole('button', { name: /refresh/i });
    await expect(refreshButton).toBeVisible();

    // Click refresh button
    await refreshButton.click();

    // Button should be temporarily disabled while loading
    await expect(refreshButton).toBeDisabled();

    // Wait a moment for loading to complete
    await page.waitForTimeout(500);
  });

  test('should not have console errors on analytics page', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
        });
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for visualizations to render
    await page.waitForTimeout(2000);

    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Filter out acceptable warnings
    const acceptablePatterns = [
      'DevTools',
      'Hydration',
      'css-global',
      'data-emotion',
      'next-auth',
      'vercel-scripts',
    ];

    const filteredErrors = errors.filter(
      (msg) => !acceptablePatterns.some((pattern) => msg.text.includes(pattern))
    );
    const filteredWarnings = warnings.filter(
      (msg) => !acceptablePatterns.some((pattern) => msg.text.includes(pattern))
    );
    const filteredPageErrors = pageErrors.filter(
      (msg) => !acceptablePatterns.some((pattern) => msg.includes(pattern))
    );

    expect(
      filteredErrors,
      `Found console errors: ${JSON.stringify(filteredErrors, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredWarnings,
      `Found console warnings: ${JSON.stringify(filteredWarnings, null, 2)}`
    ).toHaveLength(0);
    expect(
      filteredPageErrors,
      `Found page errors: ${JSON.stringify(filteredPageErrors, null, 2)}`
    ).toHaveLength(0);
  });

  test('should display rhythm view with user data', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check that rhythm view shows user names
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText('Bob Jones')).toBeVisible();

    // Check for average rest labels
    await expect(page.locator('text=/Avg rest:/i')).toBeVisible();
  });

  test('should persist tab selection when switching tabs', async ({ page }) => {
    await page.goto('/schedules/SCHED123/analytics');
    await page.waitForLoadState('networkidle');

    // Switch to Burden Distribution
    await page.getByRole('tab', { name: /burden distribution/i }).click();
    await expect(page.getByRole('tab', { name: /burden distribution/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Refresh the page (simulates coming back to the tab)
    // Note: In a real scenario, the tab state would be lost on refresh unless persisted
    // This test verifies that tabs work correctly within a session

    // Switch to another tab and back
    await page.getByRole('tab', { name: /frequency matrix/i }).click();
    await page.getByRole('tab', { name: /burden distribution/i }).click();
    await expect(page.getByRole('tab', { name: /burden distribution/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
