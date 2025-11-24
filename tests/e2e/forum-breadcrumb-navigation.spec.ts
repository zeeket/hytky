import { test, expect } from './fixtures/authenticated';
import { generateUniqueId, createCategory } from './helpers/test-data';

/**
 * Forum Breadcrumb Navigation Regression Tests
 *
 * These tests prevent regression of the bug where breadcrumb paths were constructed
 * as relative paths (e.g., "Category1/Category2") instead of absolute paths
 * (e.g., "/forum/Category1/Category2").
 *
 * The bug: path.slice(2, i + 2).join('/') created relative paths
 * The fix: Build absolute paths from categoriesInPath array using encodeURIComponent
 *
 * These tests verify breadcrumb hrefs are correctly constructed as absolute paths.
 */

test.describe('Forum Breadcrumb Navigation - Path Construction', () => {
  test.setTimeout(60000);

  test('breadcrumb hrefs are absolute paths with URL-encoded names', async ({
    page,
  }) => {
    const uniqueId = generateUniqueId();
    // Use spaces in names to test URL encoding
    const level1 = `Level 1 ${uniqueId}`;
    const level2 = `Level 2 ${uniqueId}`;
    const level3 = `Level 3 ${uniqueId}`;

    // Create a three-level hierarchy
    await createCategory(page, level1, '/forum');
    const level1Url = `/forum/${encodeURIComponent(level1)}`;

    await createCategory(page, level2, level1Url);
    const level2Url = `${level1Url}/${encodeURIComponent(level2)}`;

    await createCategory(page, level3, level2Url);
    const level3Url = `${level2Url}/${encodeURIComponent(level3)}`;

    // Navigate to the deepest level
    await page.goto(level3Url);
    await page.waitForLoadState('networkidle');

    // Find breadcrumb links
    const breadcrumbLinks = page.locator('a.text-white.underline');

    // Verify Level 1 breadcrumb has correct absolute path
    const level1Breadcrumb = breadcrumbLinks.filter({ hasText: level1 });
    const level1Href = await level1Breadcrumb.getAttribute('href');
    expect(level1Href).toBe(`/forum/${encodeURIComponent(level1)}`);
    expect(level1Href).toMatch(/^\/forum\//); // MUST start with /forum/ (not relative)

    // Verify Level 2 breadcrumb has correct absolute path
    const level2Breadcrumb = breadcrumbLinks.filter({ hasText: level2 });
    const level2Href = await level2Breadcrumb.getAttribute('href');
    expect(level2Href).toBe(
      `/forum/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}`
    );
    expect(level2Href).toMatch(/^\/forum\//); // MUST start with /forum/ (not relative)
  });

  test('breadcrumb hrefs handle special characters correctly', async ({
    page,
  }) => {
    const uniqueId = generateUniqueId();
    // Use special characters that need URL encoding
    const level1 = `Test & Demo ${uniqueId}`;
    const level2 = `Q&A #${uniqueId}`;

    // Create categories with special characters
    await createCategory(page, level1, '/forum');
    const level1Url = `/forum/${encodeURIComponent(level1)}`;

    await createCategory(page, level2, level1Url);
    const level2Url = `${level1Url}/${encodeURIComponent(level2)}`;

    // Navigate to Level 2
    await page.goto(level2Url);
    await page.waitForLoadState('networkidle');

    // Verify breadcrumb href is absolute path with proper encoding
    const breadcrumbLinks = page.locator('a.text-white.underline');
    const level1Breadcrumb = breadcrumbLinks.filter({ hasText: level1 });

    const level1Href = await level1Breadcrumb.getAttribute('href');
    expect(level1Href).toBe(`/forum/${encodeURIComponent(level1)}`);
    expect(level1Href).toMatch(/^\/forum\//); // MUST be absolute, not relative
    expect(level1Href).toContain('%26'); // & should be encoded
  });

  test('breadcrumb hrefs remain absolute at any nesting depth', async ({
    page,
  }) => {
    const uniqueId = generateUniqueId();
    const categories = [
      `L1 ${uniqueId}`,
      `L2 ${uniqueId}`,
      `L3 ${uniqueId}`,
      `L4 ${uniqueId}`,
    ];

    // Create a four-level hierarchy (max supported depth)
    let currentUrl = '/forum';
    for (const categoryName of categories) {
      await createCategory(page, categoryName, currentUrl);
      currentUrl = `${currentUrl}/${encodeURIComponent(categoryName)}`;
    }

    // Navigate to the deepest level
    await page.goto(currentUrl);
    await page.waitForLoadState('networkidle');

    // Check all breadcrumb links have absolute paths starting with /forum
    const breadcrumbLinks = page.locator('a.text-white.underline');
    const count = await breadcrumbLinks.count();

    // Should have root + 4 categories = 5 breadcrumbs
    expect(count).toBe(5);

    // Verify each breadcrumb (except root) has correct absolute path
    for (let i = 1; i < count; i++) {
      const link = breadcrumbLinks.nth(i);
      const href = await link.getAttribute('href');

      // CRITICAL: Must be absolute path starting with /forum/, not relative
      expect(href).toMatch(/^\/forum\//);

      // Should contain exactly i category names
      const pathParts = href?.split('/').filter(Boolean) || [];
      expect(pathParts.length).toBe(i + 1); // 'forum' + i categories
      expect(pathParts[0]).toBe('forum');
    }
  });
});
