import { test, expect } from '@playwright/test';

test.describe('Schedules Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, we'd mock authentication here
    await page.goto('/schedules');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/schedules');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test.describe('Authenticated User', () => {
    // Skip these tests until we have proper auth mocking setup
    test.skip('should display page header and description', async ({ page }) => {
      // TODO: Mock authenticated session

      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
      await expect(
        page.getByText(/Select a schedule to calculate on-call compensation/i)
      ).toBeVisible();
    });

    test.skip('should display search input', async ({ page }) => {
      // TODO: Mock authenticated session

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test.skip('should display schedule count', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      await expect(page.getByText(/schedule.*found/i)).toBeVisible();
    });

    test.skip('should filter schedules by search query', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Type in search box
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // Should filter schedules
      await expect(page.getByText('Engineering On-Call')).toBeVisible();
      await expect(page.getByText('Support Team')).not.toBeVisible();
    });

    test.skip('should display schedules in grid layout', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check for grid container
      const schedules = page.locator('[role="article"]');
      await expect(schedules).toHaveCount(3); // Assuming 3 mock schedules
    });

    test.skip('should display schedule card with all details', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check first schedule card
      const firstCard = page.locator('[role="article"]').first();

      await expect(firstCard.getByRole('heading')).toBeVisible();
      await expect(firstCard.getByText(/time zone/i)).toBeVisible();
    });

    test.skip('should show hover effect on schedule cards', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const firstCard = page.locator('[role="article"]').first();

      // Hover over card
      await firstCard.hover();

      // Card should have hover styles (transform, shadow, etc.)
      // This would need to check computed styles
    });

    test.skip('should display empty state when no schedules found', async ({ page }) => {
      // TODO: Mock authenticated session with no schedules

      await expect(page.getByText(/No schedules available/i)).toBeVisible();
      await expect(page.getByText(/Create schedules in PagerDuty to get started/i)).toBeVisible();
    });

    test.skip('should display empty state with search query', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Search for non-existent schedule
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('nonexistent schedule name');

      await expect(page.getByText(/No schedules found/i)).toBeVisible();
      await expect(page.getByText(/Try adjusting your search query/i)).toBeVisible();
    });

    test.skip('should maintain search query in URL', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // URL should reflect search (if implemented)
      // await expect(page).toHaveURL(/\?.*query=engineering/);
    });

    test.skip('should clear search when input is cleared', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);

      // Fill search
      await searchInput.fill('engineering');
      await expect(page.locator('[role="article"]')).toHaveCount(1);

      // Clear search
      await searchInput.clear();
      await expect(page.locator('[role="article"]')).toHaveCount(3);
    });

    test.skip('should display loading state while fetching schedules', async ({ page }) => {
      // TODO: Mock authenticated session with delayed response

      // Should show loading spinner
      await expect(page.getByText(/Loading schedules/i)).toBeVisible();

      // Wait for schedules to load
      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
    });

    test.skip('should display error state when API fails', async ({ page }) => {
      // TODO: Mock authenticated session with API error

      await expect(page.getByText(/Failed to Load Schedules/i)).toBeVisible();
      await expect(page.getByText(/Unable to fetch schedules from PagerDuty/i)).toBeVisible();

      // Should have retry button
      const retryButton = page.getByRole('button', { name: /Try Again/i });
      await expect(retryButton).toBeVisible();
    });

    test.skip('should retry loading schedules on error', async ({ page }) => {
      // TODO: Mock authenticated session with API error, then success

      const retryButton = page.getByRole('button', { name: /Try Again/i });
      await retryButton.click();

      // Should reload and show schedules
      await expect(page.getByRole('heading', { name: /On-Call Schedules/i })).toBeVisible();
    });

    test.skip('should handle case-insensitive search', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);

      // Search with different cases
      await searchInput.fill('ENGINEERING');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();

      await searchInput.fill('engineering');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();

      await searchInput.fill('EnGiNeErInG');
      await expect(page.getByText('Engineering On-Call')).toBeVisible();
    });

    test.skip('should display schedule timezone', async ({ page }) => {
      // TODO: Mock authenticated session and schedules data

      // Check for timezone chips
      await expect(page.getByText('America/New_York')).toBeVisible();
      await expect(page.getByText('UTC')).toBeVisible();
    });

    test.skip('should display pagination controls when there are more than 16 schedules', async ({
      page,
    }) => {
      // TODO: Mock authenticated session with 20+ schedules
      // Note: Pagination controls only appear when totalPages > 1
      // With 20 schedules, we have 2 pages (16 + 4)

      // Check for pagination buttons
      await expect(page.getByRole('button', { name: /first/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /last/i })).toBeVisible();

      // Check for Material-UI Pagination component
      await expect(page.locator('nav[aria-label="pagination navigation"]')).toBeVisible();
    });

    test.skip('should display only 16 schedules per page', async ({ page }) => {
      // TODO: Mock authenticated session with 20+ schedules

      // Check that exactly 16 schedules are displayed
      const schedules = page.locator('[role="article"]');
      await expect(schedules).toHaveCount(16);
    });

    test.skip('should navigate to next page when Next button is clicked', async ({ page }) => {
      // TODO: Mock authenticated session with 20+ schedules

      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // Should show page 2 indicator (format: "Page 2 of X • Showing Y of Z")
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // First and Previous buttons should be enabled
      await expect(page.getByRole('button', { name: /first/i })).toBeEnabled();
      await expect(page.getByRole('button', { name: /previous/i })).toBeEnabled();
    });

    test.skip('should navigate to previous page when Previous button is clicked', async ({
      page,
    }) => {
      // TODO: Mock authenticated session with 20+ schedules

      // Navigate to page 2 first
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // Navigate back to page 1
      const prevButton = page.getByRole('button', { name: /previous/i });
      await prevButton.click();

      // Should show page 1 indicator
      await expect(page.getByText(/page 1 of/i)).toBeVisible();

      // First and Previous buttons should be disabled
      await expect(page.getByRole('button', { name: /first/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    test.skip('should navigate to first page when First button is clicked', async ({ page }) => {
      // TODO: Mock authenticated session with 40+ schedules

      // Navigate to page 3
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await nextButton.click();
      await expect(page.getByText(/page 3 of/i)).toBeVisible();

      // Navigate to first page
      const firstButton = page.getByRole('button', { name: /first/i });
      await firstButton.click();

      // Should show page 1
      await expect(page.getByText(/page 1 of/i)).toBeVisible();
    });

    test.skip('should navigate to last page when Last button is clicked', async ({ page }) => {
      // TODO: Mock authenticated session with 40+ schedules

      // Navigate to last page
      const lastButton = page.getByRole('button', { name: /last/i });
      await lastButton.click();

      // Should show last page indicator
      await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();

      // Next and Last buttons should be disabled
      await expect(page.getByRole('button', { name: /next/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /last/i })).toBeDisabled();
    });

    test.skip('should navigate to specific page using pagination component', async ({ page }) => {
      // TODO: Mock authenticated session with 40+ schedules

      // Click on page 2 button in pagination
      await page.getByRole('button', { name: '2' }).click();

      // Should show page 2 indicator
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // Should display different schedules
      const schedules = page.locator('[role="article"]');
      await expect(schedules).toHaveCount(16);
    });

    test.skip('should scroll to top when navigating pages', async ({ page }) => {
      // TODO: Mock authenticated session with 20+ schedules

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));

      // Navigate to next page
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // Should scroll back to top
      await page.waitForTimeout(500); // Wait for smooth scroll
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    });

    test.skip('should show client-side search indicator', async ({ page }) => {
      // TODO: Mock authenticated session with schedules cached

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // Should show client-side search indicator
      await expect(page.getByText(/client-side search/i)).toBeVisible();
    });

    test.skip('should show API search indicator when no cached results', async ({ page }) => {
      // TODO: Mock authenticated session with limited cached schedules

      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('unique schedule name not in cache');

      // Should show API search indicator
      await expect(page.getByText(/API search/i)).toBeVisible();
    });

    test.skip('should reset to page 1 when searching', async ({ page }) => {
      // TODO: Mock authenticated session with 40+ schedules

      // Navigate to page 2
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // Search for schedules
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('engineering');

      // Should reset to page 1
      await expect(page.getByText(/page 1 of/i)).toBeVisible();
    });

    test.skip('should hide pagination when search results fit on one page', async ({ page }) => {
      // TODO: Mock authenticated session with 40+ schedules (3 pages)

      // Initially pagination should be visible (totalPages > 1)
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();

      // Search with few results (less than 16)
      const searchInput = page.getByPlaceholder(/Search schedules by name/i);
      await searchInput.fill('unique specific name');

      // Pagination should be hidden when only 1 page of results
      await expect(page.getByRole('button', { name: /next/i })).not.toBeVisible();
    });

    test.skip('should display grid with 4 columns on desktop', async ({ page }) => {
      // TODO: Mock authenticated session with schedules

      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Find the grid container with the schedules
      const grid = page.locator('[role="article"]').first().locator('xpath=..');
      const gridTemplate = await grid.evaluate(
        (el) => window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 4 columns on desktop (md breakpoint)
      // Grid uses repeat(4, 1fr) for md and above
      expect(gridTemplate.split(' ').length).toBe(4);
    });

    test.skip('should display pagination info text', async ({ page }) => {
      // TODO: Mock authenticated session with 20+ schedules

      // Should show pagination info like "Page 1 of 2 • Showing 16 of 20"
      await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
      await expect(page.getByText(/showing \d+ of \d+/i)).toBeVisible();
    });
  });
});

test.describe('Schedules Page - Integration', () => {
  test.skip('should navigate to schedule detail on card click', async ({ page }) => {
    // TODO: Mock authenticated session and implement navigation

    await page.goto('/schedules');

    const firstCard = page.locator('[role="article"]').first();
    await firstCard.click();

    // Should navigate to schedule detail page
    await expect(page).toHaveURL(/\/schedules\/[A-Z0-9]+/);
  });

  test.skip('should maintain pagination state during navigation', async ({ page }) => {
    // TODO: Mock authenticated session with 40+ schedules

    await page.goto('/schedules');

    // Navigate to page 2
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();
    await expect(page.getByText(/page 2 of/i)).toBeVisible();

    // Click on a schedule to navigate away
    const firstCard = page.locator('[role="article"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/schedules\/[A-Z0-9]+/);

    // Navigate back
    await page.goBack();

    // Should remember we were on page 2 (if state is preserved)
    // Note: This behavior depends on implementation
    await expect(page.getByText(/page \d+ of/i)).toBeVisible();
  });

  test.skip('should preserve Header and Footer', async ({ page }) => {
    // TODO: Mock authenticated session

    await page.goto('/schedules');

    // Check for header
    await expect(page.getByText('CalOohPay')).toBeVisible();

    // Check for footer
    await expect(page.getByText(/© \d{4}/)).toBeVisible();
  });

  test.skip('should support keyboard navigation', async ({ page }) => {
    // TODO: Mock authenticated session and schedules data

    await page.goto('/schedules');

    // Tab through schedule cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // First card should be focused
    const firstCard = page.locator('[role="article"]').first();
    await expect(firstCard).toBeFocused();

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/schedules\/[A-Z0-9]+/);
  });
});
