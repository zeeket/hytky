import { test, expect, type APIRequestContext } from './fixtures/coverage';

/**
 * Helper to clean test events via API
 * @param deleteAll - If true, delete ALL events (not just test events)
 */
async function cleanTestEvents(request: APIRequestContext, deleteAll = false) {
  const url = deleteAll ? '/api/test/events?all=true' : '/api/test/events';
  const response = await request.delete(url);
  return response.json();
}

/**
 * Helper to create a test event via API
 */
async function createTestEvent(request: APIRequestContext, options = {}) {
  const response = await request.post('/api/test/events', {
    data: options,
  });
  return response.json();
}

test.describe('Events Page', () => {
  test('should display page title', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Check title exists (language-agnostic)
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const titleText = await h1.textContent();
    expect(titleText).toBeTruthy();
  });

  test.describe.serial('Empty State', () => {
    test.beforeEach(async ({ request }) => {
      // Clean ALL events (including real ones from Google Calendar)
      await cleanTestEvents(request, true);
      // Wait for database to commit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    test.afterEach(async ({ request }) => {
      // Clean up all events after test
      await cleanTestEvents(request, true);
    });

    test('should display empty state message when no events', async ({
      page,
      request,
    }) => {
      // Ensure all events are deleted
      await cleanTestEvents(request, true);

      // Wait a bit for database to sync
      await page.waitForTimeout(500);

      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Should show empty state message (language-agnostic check)
      // English: "Check back soon" / Finnish: "Tarkista pian uudelleen"
      const bodyText = (await page.locator('body').textContent()) || '';
      const hasEmptyMessage =
        bodyText.includes('Check back soon') ||
        bodyText.includes('Tarkista pian uudelleen');
      expect(hasEmptyMessage).toBeTruthy();

      // Should NOT show event list
      const eventsList = page.locator('ul li');
      expect(await eventsList.count()).toBe(0);
    });
  });

  test.describe.serial('With Events', () => {
    test.beforeEach(async ({ request }) => {
      // Clean ALL events and seed a test event
      await cleanTestEvents(request, true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await createTestEvent(request, {
        daysFromNow: 1,
        durationHours: 1,
      });
      // Wait for database to commit and sync
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    test.afterEach(async ({ request }) => {
      // Clean up all events after test
      await cleanTestEvents(request, true);
    });

    test('should display upcoming events when events exist', async ({
      page,
    }) => {
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Should show event list
      const eventsList = page.locator('ul li');
      const listCount = await eventsList.count();
      expect(listCount).toBeGreaterThan(0);

      // Should show test event title
      await expect(page.locator('text=/Tomorrow Event/i')).toBeVisible();

      // Should NOT show empty state message
      const bodyText = (await page.locator('body').textContent()) || '';
      const hasEmptyMessage =
        bodyText.includes('Check back soon') ||
        bodyText.includes('Tarkista pian uudelleen');
      expect(hasEmptyMessage).toBeFalsy();
    });

    test('should display event with location label', async ({ page }) => {
      // Wait a bit for database to sync
      await page.waitForTimeout(500);

      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Should show "Location:" label (language-agnostic)
      // English: "Location:" / Finnish: "Sijainti:" or similar
      const bodyText = (await page.locator('body').textContent()) || '';
      const hasLocation =
        bodyText.includes('Location:') || bodyText.includes('Test Location');
      expect(hasLocation).toBeTruthy();
    });
  });

  test('should support Finnish locale', async ({ page }) => {
    await page.goto('/events?lang=fi');
    await page.waitForLoadState('networkidle');

    // Check Finnish title
    await expect(page.locator('h1')).toContainText('Tulevat tapahtumat');
  });

  test('should have working back link', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Find back link (language-agnostic - just check for link with ← arrow)
    const backLink = page.locator('a').filter({ hasText: '←' }).first();
    await expect(backLink).toBeVisible();
    await backLink.click();

    // Should navigate to homepage
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should not show loading state after data loads', async ({ page }) => {
    await page.goto('/events?lang=en');
    await page.waitForLoadState('networkidle');

    // Wait for any loading to complete
    await page.waitForTimeout(1000);

    // Loading message should not be visible
    const loadingMsg = page.locator('text=Loading events');
    await expect(loadingMsg).not.toBeVisible();
  });
});
