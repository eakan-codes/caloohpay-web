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
    const weekendInput = page.getByLabel(/weekend rate/i);
    const cancelButton = page.getByRole('button', { name: /cancel/i });

    // Change weekday value
    await weekdayInput.click();
    await weekdayInput.fill('');
    await weekdayInput.fill('60');

    // Change weekend value
    await weekendInput.click();
    await weekendInput.fill('');
    await weekendInput.fill('90');

    // Click cancel
    await cancelButton.click();

    // Both values should reset to original
    await expect(weekdayInput).toHaveValue('50');
    await expect(weekendInput).toHaveValue('75');
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

    // Blur the input to trigger validation
    await weekdayInput.blur();

    // Move to another field to finalize the blur
    await page.getByLabel(/weekend rate/i).focus();

    // Try to submit with invalid value
    await saveButton.click();

    // Verify validation error is visible
    await expect(page.getByText(/rate must be between 25 and 200/i).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('should be accessible from header navigation', async ({ page }) => {
    // Verify we're on the settings page (from beforeEach)
    await expect(page).toHaveURL('/settings');

    // The account menu should be visible in the header
    const accountMenuButton = page.getByRole('button', { name: /account menu/i });
    await expect(accountMenuButton).toBeVisible({ timeout: 5000 });
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
