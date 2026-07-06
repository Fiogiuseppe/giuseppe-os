import { defineConfig, devices } from '@playwright/test';

const testPort = process.env.PLAYWRIGHT_PORT ?? '3010';
const testBaseUrl = `http://localhost:${testPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: testBaseUrl,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command:
      `PORT=${testPort} ALLOW_TEST_ROUTES=1 AI_MODE=mock AI_PROVIDER=groq SOURCES_ENGINE_STORE=memory KNOWLEDGE_STORE=memory SOURCES_OAUTH_MOCK_EXCHANGE=1 GITHUB_CLIENT_ID=test_github_client GITHUB_CLIENT_SECRET=test_github_secret UREES_WEBSITE_URL=https://urees.shop NEXT_PUBLIC_APP_URL=${testBaseUrl} npm run dev`,
    url: testBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
