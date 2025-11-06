import { test, expect } from './fixtures/authenticated';
import {
  generateUniqueId,
  createCategory,
  createThread,
  navigateToUrl,
  countElements,
} from './helpers/test-data';

/**
 * Forum URL Navigation Tests - Version 3
 *
 * These tests verify URL-based navigation to forum categories and threads.
 * Setup uses URL navigation (not clicks) to avoid dependency on click behavior.
 * Tests use unique identifiers for data isolation and run in parallel.
 */

test.describe('Forum URL Navigation - Core Functionality', () => {
  test.setTimeout(60000);

  test('navigates to top-level category and shows subcategories', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const categoryName = `URLNav_Top_${uniqueId}`;
    const subcategoryName = `URLNav_Sub_${uniqueId}`;

    // Create parent category at root
    await createCategory(page, categoryName, '/forum');

    // Navigate to parent via URL and create subcategory
    const parentUrl = `/forum/${encodeURIComponent(categoryName)}`;
    await createCategory(page, subcategoryName, parentUrl);

    // Test: Navigate to parent via URL again
    const result = await navigateToUrl(page, parentUrl);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);

    // Verify subcategory is visible
    const subcategoryCount = await countElements(page, `ul button:has-text("${subcategoryName}")`);
    expect(subcategoryCount).toBeGreaterThan(0);
  });

  test('navigates to subcategory and shows threads', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const parentName = `URLNav_Parent_${uniqueId}`;
    const subcategoryName = `URLNav_SubCat_${uniqueId}`;
    const threadName = `URLNav_Thread_${uniqueId}`;

    // Create parent
    await createCategory(page, parentName, '/forum');

    // Create subcategory under parent
    const parentUrl = `/forum/${encodeURIComponent(parentName)}`;
    await createCategory(page, subcategoryName, parentUrl);

    // Create thread in subcategory
    const subcategoryUrl = `${parentUrl}/${encodeURIComponent(subcategoryName)}`;
    await page.goto(subcategoryUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadName, `Test content ${uniqueId}`);

    // Test: Navigate to subcategory via URL
    const result = await navigateToUrl(page, subcategoryUrl);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);

    // Verify thread is visible
    const threadCount = await countElements(page, `ul button:has-text("${threadName}")`);
    expect(threadCount).toBeGreaterThan(0);
  });

  test('navigates to thread and shows content', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const categoryName = `URLNav_CatThread_${uniqueId}`;
    const threadName = `URLNav_Thread_${uniqueId}`;
    const threadContent = `Thread content ${uniqueId}`;

    // Create category
    await createCategory(page, categoryName, '/forum');

    // Create thread in category
    const categoryUrl = `/forum/${encodeURIComponent(categoryName)}`;
    await page.goto(categoryUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadName, threadContent);

    // Test: Navigate to thread via URL
    const threadUrl = `${categoryUrl}/${encodeURIComponent(threadName)}`;
    const result = await navigateToUrl(page, threadUrl);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);

    // Verify we're in thread view with correct content
    await expect(page.locator(`h2:has-text("Lanka: ${threadName}")`)).toBeVisible();
    await expect(page.locator(`text="${threadContent}"`)).toBeVisible();
  });

  test('handles categories with spaces in name', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const categoryWithSpaces = `URL Nav With Spaces ${uniqueId}`;
    const subcategoryName = `SubCat ${uniqueId}`;

    // Create category with spaces
    await createCategory(page, categoryWithSpaces, '/forum');

    // Create subcategory
    const parentUrl = `/forum/${encodeURIComponent(categoryWithSpaces)}`;
    await createCategory(page, subcategoryName, parentUrl);

    // Test: Navigate with proper URL encoding
    const result = await navigateToUrl(page, parentUrl);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);

    // Verify subcategory is visible
    const subcategoryCount = await countElements(page, `ul button:has-text("${subcategoryName}")`);
    expect(subcategoryCount).toBeGreaterThan(0);
  });

  test('returns 404 for non-existent paths', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const nonExistentPath = `/forum/NonExistent_${uniqueId}`;

    const result = await navigateToUrl(page, nonExistentPath, { expectedStatus: 404 });

    expect(result.status).toBe(404);
  });

  test('navigates through 3 levels of hierarchy', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const level1 = `L1_${uniqueId}`;
    const level2 = `L2_${uniqueId}`;
    const level3 = `L3_${uniqueId}`;
    const thread = `Deep_Thread_${uniqueId}`;

    // Create 3-level hierarchy using URL navigation
    await createCategory(page, level1, '/forum');

    const url1 = `/forum/${encodeURIComponent(level1)}`;
    await createCategory(page, level2, url1);

    const url2 = `${url1}/${encodeURIComponent(level2)}`;
    await createCategory(page, level3, url2);

    const url3 = `${url2}/${encodeURIComponent(level3)}`;
    await page.goto(url3);
    await page.waitForLoadState('networkidle');
    await createThread(page, thread, `Deep content ${uniqueId}`);

    // Test: Navigate to deepest level via URL
    const result = await navigateToUrl(page, url3);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);

    // Verify thread is visible
    const threadCount = await countElements(page, `ul button:has-text("${thread}")`);
    expect(threadCount).toBeGreaterThan(0);

    // Verify breadcrumb shows full path
    await expect(page.locator(`text="${level1}"`)).toBeVisible();
    await expect(page.locator(`text="${level2}"`)).toBeVisible();
    await expect(page.locator(`text="${level3}"`)).toBeVisible();
  });
});
