import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e/uat',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
  },
  expect: { timeout: 15000 },
  timeout: 60000,
  reporter: [['json', { outputFile: 'playwright-results.json' }], ['list']],
});
