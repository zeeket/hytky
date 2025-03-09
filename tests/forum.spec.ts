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
  await page.waitForSelector('text="Luo uusi lanka"')
});
