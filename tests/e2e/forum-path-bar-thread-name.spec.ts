import { test, expect } from './fixtures/authenticated';
import {
  generateUniqueId,
  createCategory,
  createThread,
} from './helpers/test-data';

/**
 * Forum Path Bar - Thread Name Regression Test
 *
 * The ForumPathBar breadcrumb only ever rendered the category chain
 * ("Olet tässä: Category1 / Category2"). When viewing a thread, the thread's
 * own name was shown only in a separate heading, not appended to the path bar.
 *
 * This test verifies the path bar itself includes the thread name as its
 * final segment when a thread is open.
 */

test.describe('Forum Path Bar - Thread Name', () => {
  test.setTimeout(60000);

  test('path bar shows the thread name when viewing a thread', async ({
    page,
  }) => {
    const uniqueId = generateUniqueId();
    const categoryName = `Category ${uniqueId}`;
    const threadName = `Thread ${uniqueId}`;

    await createCategory(page, categoryName, '/forum');
    const categoryUrl = `/forum/${encodeURIComponent(categoryName)}`;

    await page.goto(categoryUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadName, 'Test content');

    const threadUrl = `${categoryUrl}/${encodeURIComponent(threadName)}`;
    await page.goto(threadUrl);
    await page.waitForLoadState('networkidle');

    const pathBar = page.locator('[data-testid="forum-path-bar"]');
    await expect(pathBar).toContainText(categoryName);
    await expect(pathBar).toContainText(threadName);
  });
});
