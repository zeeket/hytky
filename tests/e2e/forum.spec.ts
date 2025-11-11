import { test, expect } from './fixtures/authenticated';

/**
 * Forum Tests
 *
 * These tests exercise both viewing and content creation functionality.
 * Tests are organized into two suites:
 * 1. Forum Viewing - Tests UI rendering and navigation
 * 2. Forum Content Creation - Sequential tests that create and verify content
 */

// Generate unique identifiers for test content to avoid conflicts
const timestamp = Date.now();
const testCategoryName = `Test Category ${timestamp}`;
const testSubcategoryName = `Test Subcategory ${timestamp}`;
const testThreadName = `Test Thread ${timestamp}`;
const testThreadContent = `This is test content created at ${timestamp}`;

test.describe('Forum Viewing', () => {
  test.setTimeout(30000);

  test('can navigate to forum page and see UI elements', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Verify we're on the forum page
    await expect(page).toHaveURL(/\/forum/);

    // Verify the forum heading is visible
    await expect(page.locator('h1:has-text("Foorumi")')).toBeVisible();

    // Verify create buttons are visible (authenticated state)
    await expect(
      page.locator('button:has-text("Luo uusi kategoria")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Luo uusi lanka")')
    ).toBeVisible();

    // Verify breadcrumb navigation
    await expect(page.locator('text="Olet tässä:"')).toBeVisible();
  });

  test('can open create category modal', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Click the category button
    await page.locator('button:has-text("Luo uusi kategoria")').click();

    // Verify modal appears
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).toBeVisible();

    // Verify form elements
    await expect(page.locator('input#name')).toBeVisible();
    await expect(
      page.locator('button.bg-red-600:has-text("Luo")')
    ).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Cancel")').click();
  });

  test('can open create thread modal', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Click the thread button
    await page.locator('button:has-text("Luo uusi lanka")').click();

    // Verify modal appears
    await expect(page.locator('h4:has-text("Luo uusi lanka")')).toBeVisible();

    // Verify form has two inputs (thread name and content)
    const inputs = await page.locator('input#name').all();
    expect(inputs.length).toBe(2);

    // Verify buttons
    await expect(
      page.locator('button.bg-red-600:has-text("Luo")')
    ).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Cancel")').click();
  });

  test('can interact with forum navigation elements', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Click on root category link in breadcrumb
    await page.locator('a[href=""]').first().click();
    await page.waitForLoadState('networkidle');

    // Should still be on forum page
    await expect(page).toHaveURL(/\/forum/);
    await expect(page.locator('h1:has-text("Foorumi")')).toBeVisible();
  });

  test('forum page renders correctly on direct navigation', async ({
    page,
  }) => {
    // Navigate directly to forum without going through homepage first
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Verify page loads with all essential elements
    await expect(page.locator('h1:has-text("Foorumi")')).toBeVisible();
    await expect(
      page.locator('button:has-text("Luo uusi kategoria")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Luo uusi lanka")')
    ).toBeVisible();

    // Verify breadcrumb shows root
    await expect(page.locator('text="Olet tässä:"')).toBeVisible();
  });
});

/**
 * Forum Content Creation Tests
 *
 * These tests run sequentially to create and verify forum content:
 * 1. Create a top-level category
 * 2. Verify it appears on the forum page
 * 3. Create a subcategory within it
 * 4. Verify the subcategory appears
 * 5. Create a thread in the subcategory
 * 6. Verify the thread appears
 * 7. Navigate to thread and verify content
 *
 * Using describe.serial() ensures tests run in order and build on each other,
 * simulating a realistic user workflow.
 */
test.describe.serial('Forum Content Creation', () => {
  test.setTimeout(30000);

  test('can create a top-level category', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Open create category modal
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).toBeVisible();

    // Fill in category name
    await page.locator('input#name').fill(testCategoryName);

    // Click create button
    await page.locator('button.bg-red-600:has-text("Luo")').click();

    // Wait for modal to close (indicates success)
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();
  });

  test('newly created category appears on forum page', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Verify the new category is visible in the forum list
    await expect(page.locator(`text="${testCategoryName}"`)).toBeVisible();
  });

  test('can navigate into new category and create subcategory', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Click on the category we just created
    await page
      .locator(`ul button:has-text("${testCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Verify we're in the category (breadcrumb should show it)
    await expect(page.locator(`text="${testCategoryName}"`)).toBeVisible();

    // Open create category modal (to create subcategory)
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).toBeVisible();

    // Fill in subcategory name
    await page.locator('input#name').fill(testSubcategoryName);

    // Click create button
    await page.locator('button.bg-red-600:has-text("Luo")').click();

    // Wait for modal to close
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();
  });

  test('subcategory appears in parent category', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to parent category
    await page
      .locator(`ul button:has-text("${testCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Verify subcategory is visible
    await expect(page.locator(`text="${testSubcategoryName}"`)).toBeVisible();
  });

  test('can create a thread in subcategory', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to parent category
    await page
      .locator(`ul button:has-text("${testCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Navigate to subcategory
    await page
      .locator(`ul button:has-text("${testSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Open create thread modal
    await page.locator('button:has-text("Luo uusi lanka")').click();
    await expect(page.locator('h4:has-text("Luo uusi lanka")')).toBeVisible();

    // Fill in thread name and content
    // Note: There are two inputs with id="name", we need the first for thread name
    const inputs = await page.locator('input#name').all();
    await inputs[0].fill(testThreadName);
    await inputs[1].fill(testThreadContent);

    // Click create button
    await page.locator('button.bg-red-600:has-text("Luo")').click();

    // Wait for modal to close
    await expect(
      page.locator('h4:has-text("Luo uusi lanka")')
    ).not.toBeVisible();
  });

  test('newly created thread appears in subcategory', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to parent category
    await page
      .locator(`ul button:has-text("${testCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Navigate to subcategory
    await page
      .locator(`ul button:has-text("${testSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Verify thread is visible
    await expect(page.locator(`text="${testThreadName}"`)).toBeVisible();
  });

  test('can navigate to thread and see content', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to parent category
    await page
      .locator(`ul button:has-text("${testCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Navigate to subcategory
    await page
      .locator(`ul button:has-text("${testSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Click on the thread
    await page
      .locator(`ul button:has-text("${testThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Verify we're in the thread view
    // Thread title is displayed as "Lanka: {threadName}" in an h2 tag
    await expect(
      page.locator(`h2:has-text("Lanka: ${testThreadName}")`)
    ).toBeVisible();

    // Verify the thread content (first post) is visible
    await expect(page.locator(`text="${testThreadContent}"`)).toBeVisible();

    // Verify breadcrumb bar is present (even if categoriesInPath is empty due to SSR limitation)
    await expect(page.locator('text="Olet tässä:"')).toBeVisible();
  });
});
