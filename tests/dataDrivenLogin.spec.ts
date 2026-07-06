import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginRecord } from '../types';
import loginData from '../data/loginData.json';

/**
 * Data-Driven Testing example.
 * A single test is generated for every record in data/loginData.json,
 * so adding a new scenario only requires editing the JSON file -
 * no test code changes needed.
 */
const records = loginData as LoginRecord[];

test.describe('Login - Data Driven Tests @data-driven', () => {
  for (const record of records) {
    test(`${record.scenario}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.login(record.username, record.password);

      if (record.expected === 'success') {
        await expect(page).toHaveURL(/inventory.html/);
      } else {
        await expect(loginPage.errorMessage).toBeVisible();
        if (record.expectedMessage) {
          const message = await loginPage.getErrorMessage();
          expect(message).toContain(record.expectedMessage);
        }
      }
    });
  }
});
