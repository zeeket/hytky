import { test, expect } from './e2e/fixtures/coverage';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HYTKY/);
});

/**
 * Telegram Login Widget Integration Test
 *
 * Note: This test verifies the integration of @telegram-auth/react LoginButton,
 * but cannot test the internal iframe content due to cross-origin restrictions.
 *
 * The Telegram widget loads in an iframe from oauth.telegram.org, which is a
 * different origin than our test domain. Browsers block access to cross-origin
 * iframe content for security (Same-Origin Policy).
 *
 * What we test:
 * - Login button is visible and navigates to signin page
 * - Signin page structure is correct
 * - Telegram iframe is created and visible
 * - iframe src URL contains correct Telegram domain
 * - iframe src URL contains correct bot username
 * - iframe src URL contains origin parameter
 *
 * What we trust Telegram to handle:
 * - Rendering the "Log in with Telegram" button inside the iframe
 * - Opening the OAuth popup when clicked
 * - Handling the authentication flow
 *
 * This boundary testing approach is sufficient to ensure our integration is correct.
 * See TELEGRAM_LOGIN_TESTING_STRATEGY.md for detailed rationale.
 */
test('login flow - verify Telegram widget integration', async ({ page }) => {
  // Navigate to the main page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click the login button (text varies by locale: EN or FI)
  const loginButton = page.locator(
    'button:has-text("Sign in"), button:has-text("Kirjaudu sisään")'
  );
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  // Wait for navigation to the signin page
  await page.waitForURL(/\/auth\/signin/);
  await expect(page).toHaveURL(/\/auth\/signin/);

  // Verify page structure
  await expect(page).toHaveTitle(/HYTKY.*Kirjaudu sisään/);
  const heading = page.locator('h1:has-text("Jäsenten sisäänkirjautuminen")');
  await expect(heading).toBeVisible();

  // Wait for the Telegram widget iframe to be created by @telegram-auth/react
  const iframe = page.locator('iframe');
  await expect(iframe).toBeVisible({ timeout: 10000 });

  // CRITICAL: Validate iframe src URL to ensure correct integration
  const iframeSrc = await iframe.getAttribute('src');

  if (!iframeSrc) {
    throw new Error('Telegram iframe src attribute is missing');
  }

  // Must contain Telegram OAuth domain
  expect(iframeSrc).toMatch(/oauth\.telegram\.org|telegram\.org\/embed/);

  // Must contain the bot username from environment
  const botName = process.env.NEXT_PUBLIC_TG_BOT_NAME;
  expect(botName).toBe('testHYTKYbot');
  expect(iframeSrc).toContain(botName);

  // Should contain origin parameter (domain validation)
  expect(iframeSrc).toMatch(/origin=/);

  // Take a screenshot for visual verification
  await page.screenshot({
    path: 'test-results/telegram-widget-integration.png',
    fullPage: true,
  });

  // Note: We cannot test iframe internal content due to cross-origin restrictions.
  // The iframe loads from telegram.org which is a different origin than our test domain.
  // If the iframe src is correct (which we've validated above), the Telegram widget
  // will work correctly for real users.
});
