import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Fast Food/);
});

test('login page accessible', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1').filter({ hasText: /Sign In/ })).toBeVisible();
});

test('dashboard requires authentication', async ({ page }) => {
  await page.goto('/dashboard');
  // Should redirect to login or show unauthorized message
  await expect(page.url()).not.toContain('/dashboard');
});
