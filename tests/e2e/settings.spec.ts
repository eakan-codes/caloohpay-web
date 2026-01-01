import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page (assumes authenticated session)
    await page.goto('/settings');
  });

  test('should display settings page with form', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { level: 1, name: /settings/i })).toBeVisible();

    // Check description text
    await expect(page.getByText(/customize your payment rates/i)).toBeVisible();

    // Check form inputs are present
    await expect(page.getByLabel(/weekday rate/i)).toBeVisible();
    await expect(page.getByLabel(/weekend rate/i)).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /restore defaults/i })).toBeVisible();
  });

  test('should display default rate values', async ({ page }) => {
    const weekdayInput = page.getByLabel(/weekday rate/i);
    const weekendInput = page.getByLabel(/weekend rate/i);

    // Default values should be visible
    await expect(weekdayInput).toHaveValue('50');
    await expect(weekendInput).toHaveValue('75');
  });

  test('should persist rate changes across page reload', async ({ page }) => {
    // Get input fields
    const weekdayInput = page.getByLabel(/weekday rate/i);
    const weekendInput = page.getByLabel(/weekend rate/i);
    const saveButton = page.getByRole('button', { name: /save/i });

    // Change weekday rate
    await weekdayInput.click();
    await weekdayInput.fill('');
    await weekdayInput.fill('60');

    // Change weekend rate
    await weekendInput.click();
    await weekendInput.fill('');
    await weekendInput.fill('85');

    // Save changes
    await saveButton.click();

    // Wait for success message
    await expect(page.getByText(/settings saved successfully/i)).toBeVisible({ timeout: 3000 });

    // Reload the page
    await page.reload();

    // Verify values persist after reload
    await expect(weekdayInput).toHaveValue('60');
    await expect(weekendInput).toHaveValue('85');
  });

  test('should reset values when cancel is clicked', async ({ page }) => {
    const weekdayInput = page.getByLabel(/weekday rate/i);
    const cancelButton = page.getByRole('button', { name: /cancel/i });

    // Change value
    await weekdayInput.click();
    await weekdayInput.fill('');
    await weekdayInput.fill('60');

    // Click cancel
    await cancelButton.click();

    // Value should reset to original
    await expect(weekdayInput).toHaveValue('50');
  });

  test('should restore default values when restore defaults is clicked', async ({ page }) => {
    const weekdayInput = page.getByLabel(/weekday rate/i);
    const weekendInput = page.getByLabel(/weekend rate/i);
    const saveButton = page.getByRole('button', { name: /save/i });
    const restoreButton = page.getByRole('button', { name: /restore defaults/i });

    // Change values to something non-default
    await weekdayInput.click();
    await weekdayInput.fill('');
    await weekdayInput.fill('100');

    await weekendInput.click();
    await weekendInput.fill('');
    await weekendInput.fill('150');

    // Save the non-default values
    await saveButton.click();
    await expect(page.getByText(/settings saved successfully/i)).toBeVisible();

    // Click restore defaults
    await restoreButton.click();

    // Values should be back to defaults
    await expect(weekdayInput).toHaveValue('50');
    await expect(weekendInput).toHaveValue('75');
  });

  test('should validate rate inputs', async ({ page }) => {
    const weekdayInput = page.getByLabel(/weekday rate/i);
    const saveButton = page.getByRole('button', { name: /save/i });

    // Try to enter invalid value (below minimum)
    await weekdayInput.click();
    await weekdayInput.fill('');
    await weekdayInput.fill('10'); // Below minimum of 25

    // Click save
    await saveButton.click();

    // Should show validation error (React Hook Form validation)
    await expect(page.getByText(/must be at least 25/i)).toBeVisible({ timeout: 2000 });
  });

  test('should be accessible from header navigation', async ({ page }) => {
    // Start from home
    await page.goto('/');

    // Click Settings link in header
    await page.getByRole('link', { name: /settings/i }).click();

    // Should navigate to settings page
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { level: 1, name: /settings/i })).toBeVisible();
  });

  test('should display information note about rate application', async ({ page }) => {
    // Check for information box
    await expect(
      page.getByText(/these rates are used to calculate your on-call compensation/i)
    ).toBeVisible();

    // Check for weekday/weekend explanation
    await expect(page.getByText(/weekday rates apply monday–thursday/i)).toBeVisible();
  });
});
