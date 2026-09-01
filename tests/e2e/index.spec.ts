import { test, expect } from './fixtures/coverage';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HYTKY/);
});

test('has theme-color meta tag matching page background', async ({ page }) => {
  await page.goto('/');

  // The background gradient starts at #000000 — theme-color must match.
  const themeColor = await page.$eval('meta[name="theme-color"]', (el) =>
    el.getAttribute('content')
  );
  expect(themeColor).toBe('#000000');
});

/**
 * Telegram OpenID Connect Login Integration Test
 *
 * Login uses Telegram's OIDC provider through NextAuth: pressing the button
 * posts to NextAuth, which redirects the browser to Telegram's authorization
 * endpoint and later receives the ID token server-side. There is no
 * third-party iframe or script on the page any more.
 *
 * What we test:
 * - Login button is visible and navigates to signin page
 * - Signin page structure is correct, with no embedded third-party frame
 * - NextAuth exposes the `telegram` OIDC provider with our callback URL
 * - Rejected logins surface an error message on our own signin page
 *
 * What we trust Telegram and NextAuth to handle:
 * - The authorization page, PKCE/state verification and the token exchange
 * - Verifying the ID token signature against Telegram's JWKS
 *
 * The redirect itself is deliberately not followed: it leaves our origin and
 * requires real Telegram credentials, so this stays a boundary test.
 */
test('login flow - verify Telegram OIDC integration', async ({ page }) => {
  // Verify the login button is visible on the homepage (smoke check only —
  // the actual signIn() call uses window.location and races with hydration).
  await page.goto('/');
  const loginButton = page.locator(
    'button:has-text("Sign in"), button:has-text("Kirjaudu sisään")'
  );
  await expect(loginButton).toBeVisible();

  // Navigate directly to the signin page (SSR, 100% reliable).
  await page.goto('/auth/signin');
  await expect(page).toHaveURL(/\/auth\/signin/);

  // Verify page structure
  await expect(page).toHaveTitle(/HYTKY.*Kirjaudu sisään/);
  const heading = page.locator('h1:has-text("Jäsenten sisäänkirjautuminen")');
  await expect(heading).toBeVisible();

  // The login button is ours now, and nothing is embedded from Telegram.
  const telegramButton = page.getByRole('button', {
    name: /Kirjaudu Telegramilla/i,
  });
  await expect(telegramButton).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);

  // CRITICAL: the provider the button signs in with must be wired up
  // server-side as an OAuth/OIDC provider on our own callback URL.
  const response = await page.request.get('/api/auth/providers');
  expect(response.ok()).toBeTruthy();
  const providers = (await response.json()) as Record<
    string,
    { id: string; type: string; callbackUrl: string } | undefined
  >;
  expect(providers.telegram?.type).toBe('oauth');
  expect(providers.telegram?.callbackUrl).toMatch(
    /\/api\/auth\/callback\/telegram$/
  );

  // Take a screenshot for visual verification
  await page.screenshot({
    path: 'test-results/telegram-login-integration.png',
    fullPage: true,
  });
});

test('login flow - rejected logins show an error on the signin page', async ({
  page,
}) => {
  // NextAuth redirects failures back here (`pages.error`), e.g. AccessDenied
  // for a user HYTKYbot reports as `nakki`.
  await page.goto('/auth/signin?error=AccessDenied');

  // Next.js's own route announcer also carries role="alert", so filter by
  // text content to avoid a strict-mode match on both elements.
  const alert = page
    .getByRole('alert')
    .filter({ hasText: 'Telegram-ryhmässä' });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('Telegram-ryhmässä');
});
