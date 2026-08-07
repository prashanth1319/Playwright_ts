import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Login - Smoke Tests @smoke', () => {
  test('valid user can log in and land on products page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('locked out user sees an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toBeVisible();
    const message = await loginPage.getErrorMessage();
    expect(message).toContain('locked out');
  });
});
