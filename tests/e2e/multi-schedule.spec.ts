import { test, expect } from '@playwright/test';

const SEEDED = process.env.ENABLE_TEST_SESSION_SEED === 'true';

test.describe('Multi-Schedule Payment Grid', () => {
  // Can only run this if authenticated/seeded, otherwise we get redirected to login
  test.skip(!SEEDED, 'Skipped in unauthenticated E2E projects.');

  test.beforeEach(async ({ page }) => {
    // Mock the schedules search endpoint
    await page.route('**/api/schedules*', async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get('query') || '';

      const schedules = [
        { id: 'P123456', name: 'Primary On-Call', time_zone: 'Europe/London' },
        { id: 'P789012', name: 'Secondary On-Call', time_zone: 'US/Pacific' },
        { id: 'P345678', name: 'Tertiary On-Call', time_zone: 'Asia/Tokyo' },
      ].filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ schedules, total: schedules.length }),
      });
    });

    // Mock the multi-schedule report endpoint
    await page.route('**/api/reports/multi-schedule**', async (route) => {
      // Just return a static response for now to verify the UI renders it
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reports: [
            {
              metadata: {
                name: 'Primary On-Call',
                id: 'P123456',
                time_zone: 'Europe/London',
                html_url: 'https://pagerduty.com/schedules/P123456',
              },
              employees: [
                {
                  name: 'Alice Smith',
                  totalCompensation: 1550,
                  weekdayHours: 10,
                  weekendHours: 14,
                },
              ],
            },
          ],
        }),
      });
    });

    // Navigate via UI instead of direct URL to verify Navigation Link
    await page.goto('/schedules');
    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page).toHaveURL(/\/schedules\/payment-grid/);
  });

  test('should render the page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Multi-Schedule Reports' })).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    await expect(
      page.getByText('Select one or more schedules above to generate a payment report.')
    ).toBeVisible();
  });

  test('should allow selecting schedules and display the grid', async ({ page }) => {
    // Wait for the autocomplete to be ready
    const autocomplete = page.getByLabel('Search Schedules');
    await expect(autocomplete).toBeVisible();

    // Type to search
    await autocomplete.click();
    await autocomplete.fill('Primary');

    // Select the option
    await page.getByRole('option', { name: 'Primary On-Call' }).click();

    // Verify the grid appears and shows data
    // Data loading is triggered by selection

    // In AG Grid, "Primary On-Call" is a cell value, possibly a link
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Primary On-Call' })).toBeVisible();

    // Employee name
    await expect(page.getByText('Alice Smith')).toBeVisible();

    // Compensation (formatted with currency)
    // The grid formats as `£1,550.00`
    await expect(page.getByText('£1,550.00')).toBeVisible();
  });
});
