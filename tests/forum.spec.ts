/* eslint-disable @typescript-eslint/no-unsafe-call */
import { test, expect } from '@playwright/test';
import { login, logout } from './setup/auth';

test('Guest user cannot forum', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await logout(page);
  await page.goto('/forum/');
  await expect(page).toHaveURL(/\//);
});

test('Logged in user can access forum', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  await page.goto('/forum/');
  try {
    await page.waitForSelector('text="Luo uusi lanka"', { timeout: 5000 });
  }
  catch (e) {
    await page.screenshot({ path: 'forum.png' });
    console.error(await page.content());
    throw e;
  }
});
