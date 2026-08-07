import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import {
  CartPage,
  CheckoutInfoPage,
  CheckoutOverviewPage,
  CheckoutCompletePage,
} from '../pages/CartPage';
import { CheckoutRecord } from '../types';
import checkoutData from '../data/checkoutData.json';

const records = checkoutData as CheckoutRecord[];

test.describe('Cart & Checkout - End to End Flow @regression', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('full purchase flow: add item, checkout, and confirm order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutInfoPage = new CheckoutInfoPage(page);
    const checkoutOverviewPage = new CheckoutOverviewPage(page);
    const checkoutCompletePage = new CheckoutCompletePage(page);

    await inventoryPage.addProductToCartByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toContain('Sauce Labs Backpack');

    await cartPage.checkout();
    await checkoutInfoPage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '10001' });
    await checkoutInfoPage.continueToOverview();

    await expect(page).toHaveURL(/checkout-step-two.html/);
    const total = await checkoutOverviewPage.getTotal();
    expect(total).toMatch(/Total/);

    await checkoutOverviewPage.finish();
    const completeMessage = await checkoutCompletePage.getCompleteMessage();
    expect(completeMessage).toContain('Thank you for your order');
  });

  // Data-driven checkout validation using data/checkoutData.json
  for (const record of records) {
    test(`checkout info validation: ${record.scenario}`, async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutInfoPage = new CheckoutInfoPage(page);

      await inventoryPage.addProductToCartByName('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();

      await checkoutInfoPage.fillInfo(record);
      await checkoutInfoPage.continueToOverview();

      if (record.expected === 'success') {
        await expect(page).toHaveURL(/checkout-step-two.html/);
      } else {
        await expect(checkoutInfoPage.errorMessage).toBeVisible();
        const message = await checkoutInfoPage.getErrorMessage();
        expect(message).toContain(record.expectedMessage);
      }
    });
  }
});
