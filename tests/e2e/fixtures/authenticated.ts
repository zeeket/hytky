import { test as base } from './coverage';
import {
  createTestSessionToken,
  getSessionCookieName,
  DEFAULT_TEST_USER,
} from '../helpers/test-session';

/**
 * Authenticated Test Fixture
 *
 * Extends the coverage fixture to automatically inject a valid NextAuth
 * session cookie before each test. This allows tests to access protected
 * routes and tRPC procedures without going through the Telegram OAuth flow.
 *
 * The session is created using NextAuth's own JWT encoding, so the app
 * accepts it as a valid session with no code changes required.
 *
 * Usage:
 *   import { test, expect } from './fixtures/authenticated';
 *
 *   test('can access forum', async ({ page }) => {
 *     await page.goto('/forum');
 *     // User is already authenticated as DEFAULT_TEST_USER
 *   });
 */

type AuthenticatedFixture = {
  authenticatedPage: void;
};

export const test = base.extend<AuthenticatedFixture>({
  authenticatedPage: [
    async ({ page: _page, context }, use) => {
      // Create a valid session token
      const sessionToken = await createTestSessionToken(DEFAULT_TEST_USER);
      const cookieName = getSessionCookieName();

      // Extract domain and protocol from base URL
      const baseURL =
        process.env.PLAYWRIGHT_BASE_URL || 'https://dev.docker.orb.local';
      const url = new URL(baseURL);
      const domain = url.hostname;
      const isSecure = url.protocol === 'https:';

      // Inject the session cookie into the browser context
      await context.addCookies([
        {
          name: cookieName,
          value: sessionToken,
          domain,
          path: '/',
          httpOnly: true,
          secure: isSecure,
          sameSite: 'Lax',
        },
      ]);

      // Run the test
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
