import { test, expect } from './fixtures/coverage';

test('navigate to rental page and back', async ({ page }) => {
  await page.goto('/');

  // Click the rental.
  await page.click('text="Vuokraus →"');

  // Wait for a price category heading to be visible
  const categoryHeading = await page.waitForSelector(
    'text="DJ-soittimet ja levysoittimet"'
  );
  expect(categoryHeading).not.toBeNull();

  // Wait for the "Takaisin" text (with arrow) to be visible and click it
  const takaisinLink = await page.waitForSelector(':has-text("Takaisin")');
  expect(takaisinLink).not.toBeNull();

  await takaisinLink.click();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HYTKY/);
});
