import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('login page matches baseline', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot of login form
    await expect(page.locator('main')).toHaveScreenshot('login-page.png');
  });

  test('register page matches baseline', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Take screenshot of register form
    await expect(page.locator('main')).toHaveScreenshot('register-page.png');
  });

  test('products page matches baseline', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Take screenshot of products grid
    await expect(page.locator('main')).toHaveScreenshot('products-page.png');
  });

  test('responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/components-test');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toHaveScreenshot('components-tablet.png');
  });

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/components-test');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toHaveScreenshot('components-mobile.png');
  });
});
