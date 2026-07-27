import { test, expect } from './fixtures/authenticated';
import {
  generateUniqueId,
  createCategory,
  createThread,
} from './helpers/test-data';

/**
 * Thread Menu - Mobile Viewport Tests
 *
 * Regression test for the thread hamburger menu ("Siirrä lanka" / "Poista lanka")
 * overflowing the left edge of the viewport on narrow (mobile) screens. The
 * dropdown is anchored with `right-0` relative to the hamburger button itself,
 * so on a short thread title (button sits near the left of the screen) the
 * fixed-width panel extends past the left edge instead of staying on-screen.
 */

test.describe('Thread menu - mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test.setTimeout(30000);

  test('dropdown menu stays fully within the viewport', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const categoryName = `Mobile_Menu_Cat_${uniqueId}`;
    const subcategoryName = `Mobile_Menu_SubCat_${uniqueId}`;
    // A short title leaves the hamburger button near the left side of a narrow
    // viewport; the dropdown is anchored right-0 to the button itself, so it can
    // extend past the left edge of the screen. Uniqueness comes from the
    // category/subcategory names, so the thread title itself can stay minimal.
    const threadName = 'Hi';

    await createCategory(page, categoryName, '/forum');
    const categoryUrl = `/forum/${encodeURIComponent(categoryName)}`;
    await createCategory(page, subcategoryName, categoryUrl);

    const subcategoryUrl = `${categoryUrl}/${encodeURIComponent(subcategoryName)}`;
    await page.goto(subcategoryUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadName, `Content ${uniqueId}`);

    await page.locator(`ul button:has-text("${threadName}")`).first().click();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="thread-menu-button"]').click();

    const dropdown = page.locator('[role="menu"]');
    await expect(dropdown).toBeVisible();

    const box = await dropdown.boundingBox();
    const viewportSize = page.viewportSize();

    expect(box).not.toBeNull();
    expect(viewportSize).not.toBeNull();

    if (box && viewportSize) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });
});
