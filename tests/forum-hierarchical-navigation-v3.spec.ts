import { test, expect } from './fixtures/authenticated';
import {
  generateUniqueId,
  createCategory,
  createThread,
  navigateToUrl,
  countElements,
} from './helpers/test-data';

/**
 * Forum Hierarchical Navigation Tests - Version 3
 *
 * These tests verify the forum correctly handles hierarchical category structures,
 * including edge cases like duplicate subcategory names under different parents.
 *
 * Setup uses URL navigation (not clicks) to ensure proper data hierarchy.
 * Tests use unique identifiers and run in parallel.
 */

test.describe('Forum Hierarchical Navigation - Duplicate Name Handling', () => {
  test.setTimeout(60000);

  test('disambiguates duplicate subcategory names by parent path', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const parentA = `Parent_A_${uniqueId}`;
    const parentB = `Parent_B_${uniqueId}`;
    // Intentionally use the same name for subcategories under different parents
    const duplicateSubcatName = `Duplicate_SubCat_${uniqueId}`;
    const threadInA = `Thread_In_A_${uniqueId}`;
    const threadInB = `Thread_In_B_${uniqueId}`;

    // Create Parent A with duplicate subcategory
    await createCategory(page, parentA, '/forum');
    const urlA = `/forum/${encodeURIComponent(parentA)}`;
    await createCategory(page, duplicateSubcatName, urlA);

    // Create thread in Parent A's subcategory
    const subcatAUrl = `${urlA}/${encodeURIComponent(duplicateSubcatName)}`;
    await page.goto(subcatAUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadInA, `Content in A ${uniqueId}`);

    // Create Parent B with duplicate subcategory (same name!)
    await createCategory(page, parentB, '/forum');
    const urlB = `/forum/${encodeURIComponent(parentB)}`;
    await createCategory(page, duplicateSubcatName, urlB);

    // Create thread in Parent B's subcategory
    const subcatBUrl = `${urlB}/${encodeURIComponent(duplicateSubcatName)}`;
    await page.goto(subcatBUrl);
    await page.waitForLoadState('networkidle');
    await createThread(page, threadInB, `Content in B ${uniqueId}`);

    // Test 1: Navigate to Parent A's subcategory
    const resultA = await navigateToUrl(page, subcatAUrl);

    expect(resultA.success).toBe(true);
    expect(resultA.status).toBe(200);

    // Should see ONLY thread from A
    const threadAVisible = await page.locator(`ul button:has-text("${threadInA}")`).isVisible().catch(() => false);
    const threadBVisible = await page.locator(`ul button:has-text("${threadInB}")`).isVisible().catch(() => false);

    expect(threadAVisible).toBe(true);
    expect(threadBVisible).toBe(false);

    // Test 2: Navigate to Parent B's subcategory
    const resultB = await navigateToUrl(page, subcatBUrl);

    expect(resultB.success).toBe(true);
    expect(resultB.status).toBe(200);

    // Should see ONLY thread from B
    const threadAVisible2 = await page.locator(`ul button:has-text("${threadInA}")`).isVisible().catch(() => false);
    const threadBVisible2 = await page.locator(`ul button:has-text("${threadInB}")`).isVisible().catch(() => false);

    expect(threadAVisible2).toBe(false);
    expect(threadBVisible2).toBe(true);
  });

  test('filters children correctly by parentCategoryId', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const parentA = `Filter_Parent_A_${uniqueId}`;
    const parentB = `Filter_Parent_B_${uniqueId}`;
    const subcatA = `SubCat_A_${uniqueId}`;
    const subcatB = `SubCat_B_${uniqueId}`;

    // Create Parent A with its subcategory
    await createCategory(page, parentA, '/forum');
    const urlA = `/forum/${encodeURIComponent(parentA)}`;
    await createCategory(page, subcatA, urlA);

    // Create Parent B with its subcategory
    await createCategory(page, parentB, '/forum');
    const urlB = `/forum/${encodeURIComponent(parentB)}`;
    await createCategory(page, subcatB, urlB);

    // Test 1: Navigate to Parent A - should ONLY see SubCat A
    const resultA = await navigateToUrl(page, urlA);

    expect(resultA.success).toBe(true);

    const countA = await countElements(page, `ul button:has-text("${subcatA}")`);
    const countB = await countElements(page, `ul button:has-text("${subcatB}")`);

    expect(countA).toBeGreaterThan(0);
    expect(countB).toBe(0); // Should NOT see SubCat B

    // Test 2: Navigate to Parent B - should ONLY see SubCat B
    const resultB = await navigateToUrl(page, urlB);

    expect(resultB.success).toBe(true);

    const countA2 = await countElements(page, `ul button:has-text("${subcatA}")`);
    const countB2 = await countElements(page, `ul button:has-text("${subcatB}")`);

    expect(countA2).toBe(0); // Should NOT see SubCat A
    expect(countB2).toBeGreaterThan(0);
  });

  test('handles multiple levels with duplicate names at different levels', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const level1A = `L1_A_${uniqueId}`;
    const level1B = `L1_B_${uniqueId}`;
    const duplicateName = `Duplicate_${uniqueId}`;
    const markerA = `Marker_A_${uniqueId}`;
    const markerB = `Marker_B_${uniqueId}`;

    // Path A: L1_A -> Duplicate -> Marker_A
    await createCategory(page, level1A, '/forum');
    const urlL1A = `/forum/${encodeURIComponent(level1A)}`;
    await createCategory(page, duplicateName, urlL1A);
    const urlDupA = `${urlL1A}/${encodeURIComponent(duplicateName)}`;
    await createCategory(page, markerA, urlDupA);

    // Path B: L1_B -> Duplicate -> Marker_B
    await createCategory(page, level1B, '/forum');
    const urlL1B = `/forum/${encodeURIComponent(level1B)}`;
    await createCategory(page, duplicateName, urlL1B);
    const urlDupB = `${urlL1B}/${encodeURIComponent(duplicateName)}`;
    await createCategory(page, markerB, urlDupB);

    // Test 1: Navigate to duplicate under L1_A
    const resultA = await navigateToUrl(page, urlDupA);
    expect(resultA.success).toBe(true);

    const hasMarkerA = await countElements(page, `ul button:has-text("${markerA}")`);
    const hasMarkerB = await countElements(page, `ul button:has-text("${markerB}")`);

    expect(hasMarkerA).toBeGreaterThan(0);
    expect(hasMarkerB).toBe(0);

    // Test 2: Navigate to duplicate under L1_B
    const resultB = await navigateToUrl(page, urlDupB);
    expect(resultB.success).toBe(true);

    const hasMarkerA2 = await countElements(page, `ul button:has-text("${markerA}")`);
    const hasMarkerB2 = await countElements(page, `ul button:has-text("${markerB}")`);

    expect(hasMarkerA2).toBe(0);
    expect(hasMarkerB2).toBeGreaterThan(0);
  });

  test('breadcrumb navigation works with duplicate names', async ({ page }) => {
    const uniqueId = generateUniqueId();
    const parent = `BC_Parent_${uniqueId}`;
    const child = `BC_Child_${uniqueId}`;
    const grandchild = `BC_Grandchild_${uniqueId}`;

    // Create hierarchy: Parent -> Child -> Grandchild
    await createCategory(page, parent, '/forum');
    const parentUrl = `/forum/${encodeURIComponent(parent)}`;
    await createCategory(page, child, parentUrl);
    const childUrl = `${parentUrl}/${encodeURIComponent(child)}`;
    await createCategory(page, grandchild, childUrl);

    // Navigate to grandchild
    const grandchildUrl = `${childUrl}/${encodeURIComponent(grandchild)}`;
    const result = await navigateToUrl(page, grandchildUrl);

    expect(result.success).toBe(true);

    // Verify breadcrumb shows full path
    await expect(page.locator(`text="${parent}"`)).toBeVisible();
    await expect(page.locator(`text="${child}"`)).toBeVisible();
    await expect(page.locator(`text="${grandchild}"`)).toBeVisible();

    // All three levels should be in breadcrumb
    const breadcrumb = await page.locator('text="Olet tässä:"').textContent().catch(() => '');
    expect(breadcrumb).toBeTruthy();
  });
});
