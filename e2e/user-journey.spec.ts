import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('user can register, login, place order, and view dashboard', async ({ page }) => {
    // Generate unique test user data
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!',
    };

    // Clean name for validation (remove numbers)
    const cleanName = `Test User`;

    // Step 1: User Registration
    await test.step('Register new user', async () => {
      await page.goto('/register');

      // Fill registration form
      await page.fill('input[name="name"]', cleanName);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);

      // Wait for form to be valid (button becomes enabled)
      await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 10000 });

      // Submit registration
      await page.click('button[type="submit"]');

      // Should redirect to login or dashboard
      await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 });

      // Verify we're on login page after successful registration
      await expect(page.url()).toContain('/login');
    });

    // Step 2: User Login
    await test.step('Login with registered user', async () => {
      // If not already on login page, navigate there
      if (!page.url().includes('/login')) {
        await page.goto('/login');
      }

      // Fill login form
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);

      // Submit login
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('/dashboard');

      // Verify dashboard loaded
      await expect(page.locator('h1')).toContainText(/Dashboard/);
    });

    // Step 3: Browse Products and Add to Cart
    await test.step('Browse products and add items to cart', async () => {
      // Navigate to products page
      await page.goto('/products');

      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]');

      // Get all available products
      const productCards = page.locator('[data-testid="product-card"]');
      const productCount = await productCards.count();

      expect(productCount).toBeGreaterThan(0);

      // Add "Classic Burger" to cart (price: $6.99)
      const burgerCard = page
        .locator('[data-testid="product-card"]')
        .filter({ hasText: 'Classic Burger' });
      await expect(burgerCard).toBeVisible();

      const addBurgerButton = burgerCard.locator('button').filter({ hasText: 'Add to Order' });
      await addBurgerButton.click();

      // Verify cart has been updated - check for cart count or success message
      await page.waitForSelector(
        '[data-testid="cart-count"], .success-message, text="Classic Burger has been added"'
      );

      // Add "Spicy Tofu Salad" to cart (price: $5.49) - vegetarian option
      const saladCard = page
        .locator('[data-testid="product-card"]')
        .filter({ hasText: 'Spicy Tofu Salad' });
      await expect(saladCard).toBeVisible();

      const addSaladButton = saladCard.locator('button').filter({ hasText: 'Add to Order' });
      await addSaladButton.click();

      // Verify second item was added
      await page.waitForSelector(
        '[data-testid="cart-count"], text="Spicy Tofu Salad has been added"'
      );

      // Expected cart total: $6.99 + $5.49 = $12.48
    });

    // Step 4: View Cart and Proceed to Checkout
    await test.step('View cart and proceed to checkout', async () => {
      // Navigate to order/cart page
      await page.goto('/order');

      // Verify cart items are displayed (should have 2 items)
      const cartItems = page.locator('[data-testid="cart-item"]');
      await expect(cartItems).toHaveCount(2);

      // Verify specific items are in cart
      await expect(page.locator('text=Classic Burger')).toBeVisible();
      await expect(page.locator('text=Spicy Tofu Salad')).toBeVisible();

      // Verify quantities (should be 1 each)
      const quantities = page.locator('[data-testid="item-quantity"]');
      await expect(quantities).toHaveCount(2);
      await expect(quantities.first()).toHaveValue('1');
      await expect(quantities.nth(1)).toHaveValue('1');

      // Verify total calculation: $6.99 + $5.49 = $12.48
      const totalElement = page.locator('[data-testid="cart-total"]');
      await expect(totalElement).toBeVisible();
      await expect(totalElement).toContainText('$12.48');

      // Test quantity modification
      const incrementButton = page.locator('[data-testid="increment-quantity"]').first();
      await incrementButton.click();

      // Verify updated total: ($6.99 * 2) + $5.49 = $19.47
      await expect(totalElement).toContainText('$19.47');

      // Proceed to checkout/payment
      const checkoutButton = page.locator('button').filter({ hasText: /Checkout|Place Order/ });
      await expect(checkoutButton).toBeVisible();
      await checkoutButton.click();
    });

    // Step 5: Complete Payment Process
    await test.step('Complete payment process', async () => {
      // Wait for payment form or confirmation
      await page.waitForSelector(
        '[data-testid="payment-form"], [data-testid="order-confirmation"]'
      );

      // If payment form is shown, fill it (mock payment)
      const paymentForm = page.locator('[data-testid="payment-form"]');
      if (await paymentForm.isVisible()) {
        // Fill mock payment details for testing
        await page.fill('input[name="cardNumber"]', '4111111111111111');
        await page.fill('input[name="expiryDate"]', '12/25');
        await page.fill('input[name="cvv"]', '123');
        await page.fill('input[name="cardholderName"]', testUser.name);

        // Verify form validation
        await expect(page.locator('input[name="cardNumber"]')).toHaveValue('4111111111111111');
        await expect(page.locator('input[name="expiryDate"]')).toHaveValue('12/25');
        await expect(page.locator('input[name="cvv"]')).toHaveValue('123');

        // Submit payment
        const submitButton = page
          .locator('button[type="submit"]')
          .filter({ hasText: /Complete Order|Pay Now/ });
        await submitButton.click();

        // Wait for processing and confirmation
        await page.waitForSelector(
          '[data-testid="order-confirmation"], .success-message, text="Order confirmed"',
          { timeout: 10000 }
        );
      }

      // Verify order confirmation with order details
      const orderConfirmation = page.locator('[data-testid="order-confirmation"]');
      await expect(orderConfirmation).toBeVisible();

      // Verify order summary shows correct items and total
      await expect(page.locator('text=Classic Burger')).toBeVisible();
      await expect(page.locator('text=Spicy Tofu Salad')).toBeVisible();
      await expect(page.locator('text=$19.47')).toBeVisible();

      // Check for order number or confirmation message
      await expect(
        page.locator('text=Order confirmed, text=Thank you, text=Order #')
      ).toBeVisible();
    });

    // Step 6: Verify Dashboard Updates
    await test.step('Verify order appears in dashboard', async () => {
      // Navigate to dashboard
      await page.goto('/dashboard');

      // Check if recent orders section shows the new order
      const recentOrders = page.locator('[data-testid="recent-orders"]');
      await expect(recentOrders).toBeVisible();

      // Verify the recent order appears with correct details
      await expect(page.locator('text=Classic Burger')).toBeVisible();
      await expect(page.locator('text=$19.47')).toBeVisible();

      // Verify order status (should be pending or confirmed)
      const orderStatus = page.locator(
        '[data-testid="order-status"], text=Pending, text=Confirmed, text=Processing'
      );
      await expect(orderStatus.first()).toBeVisible();

      // Check dashboard metrics are updated
      const totalOrdersMetric = page.locator('[data-testid="total-orders"], text=Total Orders');
      await expect(totalOrdersMetric).toBeVisible();
    });

    // Step 7: Test Profile/Dashboard Navigation
    await test.step('Test profile and dashboard navigation', async () => {
      // Navigate to profile
      await page.goto('/profile');

      // Verify user information is displayed
      await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
      await expect(page.locator(`text=${testUser.email}`)).toBeVisible();

      // Test dashboard tabs (if they exist)
      await page.goto('/dashboard');
      const dashboardTabs = page.locator('[data-testid="dashboard-tab"]');
      if ((await dashboardTabs.count()) > 0) {
        // Click on different tabs to ensure navigation works
        for (const tab of await dashboardTabs.all()) {
          await tab.click();
          // Brief wait to ensure content loads
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 8: Logout
    await test.step('Logout successfully', async () => {
      // Find and click logout button
      const logoutButton = page.locator('button').filter({ hasText: /Logout|Sign Out/ });
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();

      // Should redirect to login or home
      await page.waitForURL(/\/(login|$)/);

      // Verify logged out state
      await expect(page.locator('text=Login')).toBeVisible();
    });
  });

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    // Test dashboard access
    await page.goto('/dashboard');
    await expect(page.url()).not.toContain('/dashboard');

    // Test profile access
    await page.goto('/profile');
    await expect(page.url()).not.toContain('/profile');

    // Test order page access
    await page.goto('/order');
    await expect(page.url()).not.toContain('/order');
  });

  test('error handling for invalid registration', async ({ page }) => {
    await page.goto('/register');

    // Try to register with weak password
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');

    // Button should remain disabled due to validation
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Try with mismatched passwords
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'differentpassword');

    // Should show password mismatch error
    await expect(page.locator("text=Passwords don't match")).toBeVisible();
  });

  test('cart management and quantity modifications', async ({ page }) => {
    // This test focuses on cart functionality without full user registration
    // Assumes products are available on the products page

    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');

    // Add first available product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const addButton = firstProduct.locator('button').filter({ hasText: 'Add to Order' });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify item was added to cart
    await page.waitForSelector('[data-testid="cart-count"], .success-message');

    // Navigate to order page
    await page.goto('/order');

    // Verify cart has items
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(1);

    // Test quantity increment
    const incrementBtn = page.locator('[data-testid="increment-quantity"]').first();
    if (await incrementBtn.isVisible()) {
      await incrementBtn.click();
      // Should update quantity to 2
    }

    // Test quantity decrement
    const decrementBtn = page.locator('[data-testid="decrement-quantity"]').first();
    if (await decrementBtn.isVisible()) {
      await decrementBtn.click();
      // Should update quantity to 1
    }

    // Test removing item completely
    const decrementAgainBtn = page.locator('[data-testid="decrement-quantity"]').first();
    if (await decrementAgainBtn.isVisible()) {
      await decrementAgainBtn.click();
      // Should remove item from cart
      await expect(page.locator('text=Your cart is empty, text=No items in cart')).toBeVisible();
    }
  });

  test('accessibility keyboard navigation', async ({ page }) => {
    // Test basic keyboard navigation
    await page.goto('/');

    // Test that page is keyboard accessible
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Test form keyboard navigation
    await page.goto('/login');
    await page.keyboard.press('Tab'); // Focus email field
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab'); // Focus password field
    await page.keyboard.type('password123');
    await page.keyboard.press('Tab'); // Focus submit button

    // Verify submit button is focused
    const isSubmitFocused = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.tagName === 'BUTTON' && active?.getAttribute('type') === 'submit';
    });
    expect(isSubmitFocused).toBe(true);
  });
});
