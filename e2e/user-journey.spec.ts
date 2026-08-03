import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.skip(!!process.env.CI, 'Requires database connectivity - skipped in CI');

  test('user can register, login, place an order, and log out', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!',
    };

    await test.step('Register new user', async () => {
      await page.goto('/register');

      await page.getByLabel('Full Name').fill(testUser.name);
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password', { exact: true }).fill(testUser.password);
      await page.getByLabel('Confirm Password').fill(testUser.password);

      await page.locator('form').getByRole('button', { name: 'Create Account' }).click();

      // Successful registration redirects to the login page
      await page.waitForURL('**/login', { timeout: 10000 });
      await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    await test.step('Login with registered user', async () => {
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password', { exact: true }).fill(testUser.password);
      await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

      // Customer accounts land on the home page
      await page.waitForURL('/', { timeout: 10000 });
      await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
    });

    await test.step('Add products to the order', async () => {
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-card"]');

      const burgerCard = page
        .locator('[data-testid="product-card"]')
        .filter({ hasText: 'Classic Burger' });
      await expect(burgerCard).toBeVisible();
      await burgerCard.getByTestId('add-to-cart-button').click();
      await expect(page.getByText('Classic Burger added to order')).toBeVisible();

      const saladCard = page
        .locator('[data-testid="product-card"]')
        .filter({ hasText: 'Caesar Salad' });
      await expect(saladCard).toBeVisible();
      await saladCard.getByTestId('add-to-cart-button').click();
      await expect(page.getByText('Caesar Salad added to order')).toBeVisible();
    });

    await test.step('Review the order and adjust quantities', async () => {
      // Navigate via the header link (client-side navigation keeps the cart)
      await page.getByRole('link', { name: 'Order food' }).click();
      await page.waitForURL('**/order');

      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(2);
      await expect(rows.filter({ hasText: 'Classic Burger' })).toBeVisible();
      await expect(rows.filter({ hasText: 'Caesar Salad' })).toBeVisible();

      // Classic Burger ($8.99) + Caesar Salad ($6.99) = $15.98
      await expect(page.getByText('$15.98')).toBeVisible();

      // Increment the first item: (8.99 * 2) + 6.99 = $24.97
      await rows.first().getByRole('button', { name: 'Increase quantity' }).click();
      await expect(page.getByText('$24.97')).toBeVisible();
    });

    await test.step('Submit the order', async () => {
      await page.getByRole('button', { name: 'Confirm order' }).click();

      // The order is registered and the cart is cleared
      await expect(page.getByText("You don't have any products in your order")).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step('Log out', async () => {
      await page.getByRole('button', { name: 'User menu' }).click();
      await page.getByRole('menuitem', { name: 'Logout' }).click();
      await page.waitForURL('**/login', { timeout: 10000 });
      await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
  });

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    for (const path of ['/dashboard', '/profile', '/order', '/products']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('error handling for invalid registration', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');

    // Button stays disabled while the form is invalid
    const submitButton = page.locator('form').getByRole('button', { name: 'Create Account' });
    await expect(submitButton).toBeDisabled();

    // Mismatched passwords surface a validation error
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
    await page.getByLabel('Confirm Password').fill('differentpassword');
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('cart management and quantity modifications', async ({ page }) => {
    await test.step('Sign in as a seeded customer', async () => {
      await page.goto('/login');
      await page.getByLabel('Email').fill('jane.smith@example.com');
      await page.getByLabel('Password', { exact: true }).fill('P4$$W0rD');
      await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('/', { timeout: 10000 });
    });

    await test.step('Add a product to the cart', async () => {
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-card"]');

      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await firstProduct.getByTestId('add-to-cart-button').click();
      await expect(page.getByText(/added to order/)).toBeVisible();
    });

    await test.step('Modify quantities in the order', async () => {
      await page.getByRole('link', { name: 'Order food' }).click();
      await page.waitForURL('**/order');

      const row = page.locator('tbody tr').first();
      await expect(row).toBeVisible();

      // Starts at quantity 1
      await expect(row.getByText('1', { exact: true })).toBeVisible();

      // Increment to 2
      await row.getByRole('button', { name: 'Increase quantity' }).click();
      await expect(row.getByText('2', { exact: true })).toBeVisible();

      // Decrement back to 1
      await row.getByRole('button', { name: 'Decrease quantity' }).click();
      await expect(row.getByText('1', { exact: true })).toBeVisible();

      // Remove the item via the confirmation dialog
      await row.getByRole('button', { name: 'Remove item' }).click();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();

      await expect(page.getByText("You don't have any products in your order")).toBeVisible();
    });
  });

  test('accessibility keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // The first Tab focus lands on a focusable element
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag);

    await page.goto('/login');
    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password', { exact: true });
    const submit = page.locator('form').getByRole('button', { name: 'Sign In' });

    // Form fields are focusable and editable with the keyboard
    await email.focus();
    await expect(email).toBeFocused();
    await email.type(`keyboard${Date.now()}@example.com`);

    await password.focus();
    await expect(password).toBeFocused();
    await password.type('password123');

    // Tab advances focus away from the field
    await password.press('Tab');
    const nextTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(nextTag).not.toBe('INPUT');

    // The submit button is focusable and Enter submits the form
    await submit.focus();
    await expect(submit).toBeFocused();
    await submit.press('Enter');

    // Invalid credentials keep us on the login page
    await expect(page).toHaveURL(/\/login/);
  });
});
