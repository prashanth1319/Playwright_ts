import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory - Product & Cart Tests @regression', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('adding products updates the cart badge count', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCartByName('Sauce Labs Backpack');
    await inventoryPage.addProductToCartByName('Sauce Labs Bike Light');

    const count = await inventoryPage.getCartCount();
    expect(count).toBe(2);
  });

  test('removing a product decreases the cart badge count', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductToCartByName('Sauce Labs Backpack');
    await inventoryPage.addProductToCartByName('Sauce Labs Bike Light');
    await inventoryPage.removeProductFromCartByName('Sauce Labs Backpack');

    const count = await inventoryPage.getCartCount();
    expect(count).toBe(1);
  });

  test('sorting products by price (low to high) is reflected correctly', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
  });
});
