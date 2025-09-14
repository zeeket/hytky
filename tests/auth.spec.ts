import { test, expect } from '@playwright/test';

test('Telegram login popup opens when clicking login button', async ({ page, context }) => {
  // Go to the signin page
  await page.goto('/auth/signin');

  // Wait for the login button to be visible.
  // It’s recommended to add a data-testid to your button, e.g. data-testid="login-button",
  // so you can target it reliably. In this example, we assume there’s only one button.
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button')
  ]);

  // Wait for the popup to load.
  await popup.waitForLoadState();

  // Verify the URL of the popup includes telegram login info,
  // meaning that the Telegram login window was successfully opened.
  expect(popup.url()).toContain('telegram');
});