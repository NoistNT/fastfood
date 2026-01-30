import { test, expect } from '@playwright/test';

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual testing
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to dashboard (assuming user is already logged in)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard overview matches baseline', async ({ page }) => {
    // Wait for dashboard content to load
    await page.waitForSelector('main', { timeout: 10000 });

    // Take screenshot of the main dashboard area
    await expect(page.locator('main')).toHaveScreenshot('dashboard-overview.png');
  });

  test('dashboard charts match baseline', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('main', { timeout: 10000 });

    // Take screenshot of charts section
    await expect(page.locator('main')).toHaveScreenshot('dashboard-charts.png');
  });

  test('dashboard revenue chart matches baseline', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[data-testid="revenue-chart"]', { timeout: 10000 });

    // Take screenshot of charts section
    await expect(page.locator('[data-testid="dashboard-charts"]')).toHaveScreenshot(
      'dashboard-charts-detailed.png'
    );
  });

  test('dashboard responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.waitForSelector('[data-testid="dashboard-overview"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-overview"]')).toHaveScreenshot(
      'dashboard-tablet.png'
    );
  });

  test('dashboard responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForSelector('[data-testid="dashboard-overview"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-overview"]')).toHaveScreenshot(
      'dashboard-mobile.png'
    );
  });
});
