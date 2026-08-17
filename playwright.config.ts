import { defineConfig, devices } from '@playwright/test';

function loadDotenv() {
  try {
    require('dotenv').config();
  } catch (error) {
    // Ignore missing dotenv during editor diagnostics or in environments
    // that do not use the workspace node_modules tree.
  }
}

loadDotenv();

import { getAppConfig } from './config/env.config';

// Resolve application config for the requested environment (TEST_ENV).
const appConfig = getAppConfig(process.env.TEST_ENV);

export default defineConfig({
  // Root is testDir; use testMatch to include UI and API test folders
  testDir: '.',
  testMatch: ['UI/tests/**/*.spec.ts', 'API/**/*.spec.ts'],
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Multiple reporters: list for console, html for visual report,
  // json for programmatic parsing, junit for Jenkins test result trend graphs
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    [require.resolve('./UI/reporters/extent-reporter.js'), { outputFolder: 'extent-report' }],
  ],

  use: {
    baseURL: appConfig.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
