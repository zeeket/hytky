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

// For thread menu tests
const menuTestCategoryName = `Menu Test Category ${timestamp}`;
const menuTestSubcategoryName = `Menu Test Subcategory ${timestamp}`;
const moveTargetCategoryName = `Move Target Category ${timestamp}`;
const menuTestThreadName = `Menu Test Thread ${timestamp}`;
const menuTestThreadContent = `Menu test content created at ${timestamp}`;

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

  test('typing Enter or Space in category modal input does not close modal', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Open create category modal
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    const modalHeading = page.locator('h4:has-text("Luo uusi kategoria")');
    await expect(modalHeading).toBeVisible();

    // Get the input field
    const categoryNameInput = page.locator('input#name');

    // Type in the category name input and press Enter
    await categoryNameInput.fill('Test Category Name');
    await categoryNameInput.press('Enter');

    // Wait a bit to ensure any potential modal close animation completes
    await page.waitForTimeout(500);

    // Verify modal is still open (should NOT close)
    await expect(modalHeading).toBeVisible();

    // Type in the input and press Space
    await categoryNameInput.fill('Test category');
    await categoryNameInput.press('Space');

    // Wait a bit to ensure any potential modal close animation completes
    await page.waitForTimeout(500);

    // Verify modal is still open (should NOT close)
    await expect(modalHeading).toBeVisible();

    // Verify the input value is preserved
    // Note: pressing Space adds a space character, so the value will be "Test category "
    await expect(categoryNameInput).toHaveValue('Test category ');

    // Close modal by pressing Escape (which should work)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(modalHeading).not.toBeVisible();
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

  test('typing Enter or Space in thread modal inputs does not close modal', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Open create thread modal
    await page.locator('button:has-text("Luo uusi lanka")').click();
    const modalHeading = page.locator('h4:has-text("Luo uusi lanka")');
    await expect(modalHeading).toBeVisible();

    // Get the input fields
    const inputs = await page.locator('input#name').all();
    expect(inputs.length).toBe(2);
    const threadNameInput = inputs[0];
    const contentInput = inputs[1];

    // Type in the thread name input and press Enter
    await threadNameInput.fill('Test Thread Name');
    await threadNameInput.press('Enter');

    // Wait a bit to ensure any potential modal close animation completes
    await page.waitForTimeout(500);

    // Verify modal is still open (should NOT close)
    await expect(modalHeading).toBeVisible();

    // Type in the content input and press Space
    await contentInput.fill('Test content');
    await contentInput.press('Space');

    // Wait a bit to ensure any potential modal close animation completes
    await page.waitForTimeout(500);

    // Verify modal is still open (should NOT close)
    await expect(modalHeading).toBeVisible();

    // Verify the input values are preserved
    // Note: pressing Space adds a space character, so the value will be "Test content "
    await expect(threadNameInput).toHaveValue('Test Thread Name');
    await expect(contentInput).toHaveValue('Test content ');

    // Close modal by pressing Escape (which should work)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(modalHeading).not.toBeVisible();
  });

  test('can interact with forum navigation elements', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Click on root category link in breadcrumb
    await page.locator('a[href="/forum"]').first().click();
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

  test('can create a post in thread and see it appear with cleared input', async ({
    page,
  }) => {
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
    await expect(
      page.locator(`h2:has-text("Lanka: ${testThreadName}")`)
    ).toBeVisible();

    // Count initial posts
    const initialPosts = await page.locator('ol li').count();

    // Create a new post
    const newPostContent = `Reply to test thread at ${timestamp}`;
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Fill in the textarea
    await textarea.fill(newPostContent);

    // Verify textarea has content before submission
    await expect(textarea).toHaveValue(newPostContent);

    // Wait for the tRPC mutation to complete and page to navigate
    const navigationPromise = page.waitForLoadState('networkidle');

    // Click the submit button
    await page.locator('button:has-text("Lähetä")').click();

    // Wait for the page to update (router.replace will refresh)
    await navigationPromise;

    // Additional wait to ensure DOM is updated
    await page.waitForTimeout(1000);

    // Verify the new post appears in the thread
    await expect(page.locator(`text="${newPostContent}"`)).toBeVisible();

    // Verify post count increased by 1
    const newPostCount = await page.locator('ol li').count();
    expect(newPostCount).toBe(initialPosts + 1);

    // Verify the textarea is now empty (cleared after submission)
    await expect(textarea).toHaveValue('');
  });

  test('should create exactly one post when submitting form (regression test for duplicate posts)', async ({
    page,
  }) => {
    // Intercept network requests to verify only one mutation is called
    // Set this up before any navigation to catch all requests
    let mutationCallCount = 0;
    page.on('request', (request) => {
      if (
        request.url().includes('/api/trpc/post.createPost') &&
        request.method() === 'POST'
      ) {
        mutationCallCount++;
      }
    });

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
    await expect(
      page.locator(`h2:has-text("Lanka: ${testThreadName}")`)
    ).toBeVisible();

    // Count initial posts using a more reliable method
    // Get all post list items (excluding the form itself)
    const initialPostElements = await page
      .locator('ol li:not(:has(textarea))')
      .all();
    const initialPostCount = initialPostElements.length;

    // Create a new post with unique content
    const uniquePostContent = `Regression test post at ${Date.now()}`;
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Fill in the textarea
    await textarea.fill(uniquePostContent);

    // Verify textarea has content before submission
    await expect(textarea).toHaveValue(uniquePostContent);

    // Wait for the tRPC mutation to complete and page to navigate
    const navigationPromise = page.waitForLoadState('networkidle');

    // Click the submit button - this should trigger form submission
    await page.locator('button:has-text("Lähetä")').click();

    // Wait for the page to update (router.replace will refresh)
    await navigationPromise;

    // Additional wait to ensure DOM is updated
    await page.waitForTimeout(1000);

    // Verify only one mutation was called
    expect(mutationCallCount).toBe(1);

    // Verify the new post appears exactly once in the thread
    const postInstances = await page
      .locator(`text="${uniquePostContent}"`)
      .count();
    expect(postInstances).toBe(1);

    // Verify post count increased by exactly 1
    const finalPostElements = await page
      .locator('ol li:not(:has(textarea))')
      .all();
    const finalPostCount = finalPostElements.length;
    expect(finalPostCount).toBe(initialPostCount + 1);
  });

  test('thread menu is visible when viewing own thread', async ({ page }) => {
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
    await expect(
      page.locator(`h2:has-text("Lanka: ${testThreadName}")`)
    ).toBeVisible();

    // Verify hamburger menu is visible (user is the author)
    await expect(
      page.locator('[data-testid="thread-menu-button"]')
    ).toBeVisible();

    // Click menu and verify delete button is inside
    await page.locator('[data-testid="thread-menu-button"]').click();
    await expect(
      page.locator('[data-testid="delete-thread-button"]')
    ).toBeVisible();
  });

  test('can delete own thread and get redirected to parent category', async ({
    page,
  }) => {
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
    await expect(
      page.locator(`h2:has-text("Lanka: ${testThreadName}")`)
    ).toBeVisible();

    // Set up dialog handler to accept confirmation
    page.on('dialog', (dialog) => dialog.accept());

    // Open menu and click delete button
    await page.locator('[data-testid="thread-menu-button"]').click();
    await page.locator('[data-testid="delete-thread-button"]').click();

    // Wait for navigation back to parent category
    await page.waitForLoadState('networkidle');

    // Verify we're back in the subcategory (thread should no longer exist)
    // The thread should not be visible anymore
    await expect(
      page.locator(`ul button:has-text("${testThreadName}")`)
    ).not.toBeVisible();

    // Verify we're in the subcategory by checking the URL or breadcrumb
    await expect(page.locator(`text="${testSubcategoryName}"`)).toBeVisible();
  });
});

/**
 * Thread Menu Tests
 *
 * These tests verify the hamburger menu functionality for threads:
 * 1. Menu displays correctly with both options
 * 2. Thread can be moved to another category
 * 3. Thread can be deleted via the menu
 */
test.describe.serial('Thread Menu', () => {
  test.setTimeout(30000);

  // Setup: Create categories and thread for menu tests
  test('setup: create test categories and thread', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Create main test category
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await page.locator('input#name').fill(menuTestCategoryName);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();

    // Navigate into it and create subcategory
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await page.locator('input#name').fill(menuTestSubcategoryName);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();

    // Create move target category at root level
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await page.locator('input#name').fill(moveTargetCategoryName);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();

    // Navigate to subcategory and create test thread
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Luo uusi lanka")').click();
    const inputs = await page.locator('input#name').all();
    await inputs[0].fill(menuTestThreadName);
    await inputs[1].fill(menuTestThreadContent);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi lanka")')
    ).not.toBeVisible();
  });

  test('hamburger menu is visible when viewing own thread', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to test thread
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Verify we're in the thread view
    await expect(
      page.locator(`h2:has-text("Lanka: ${menuTestThreadName}")`)
    ).toBeVisible();

    // Verify hamburger menu button is visible
    await expect(
      page.locator('[data-testid="thread-menu-button"]')
    ).toBeVisible();
  });

  test('hamburger menu shows both options when clicked', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to test thread
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Click hamburger menu
    await page.locator('[data-testid="thread-menu-button"]').click();

    // Verify both options are visible
    await expect(
      page.locator('[data-testid="move-thread-button"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="delete-thread-button"]')
    ).toBeVisible();

    // Verify button text
    await expect(page.locator('[data-testid="move-thread-button"]')).toHaveText(
      'Siirrä lanka'
    );
    await expect(
      page.locator('[data-testid="delete-thread-button"]')
    ).toHaveText('Poista lanka');
  });

  test('can open move thread modal', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to test thread
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Click hamburger menu then move button
    await page.locator('[data-testid="thread-menu-button"]').click();
    await page.locator('[data-testid="move-thread-button"]').click();

    // Verify move modal appears
    await expect(page.locator('h3:has-text("Siirrä lanka")')).toBeVisible();
    await expect(page.locator('[data-testid="category-select"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="confirm-move-button"]')
    ).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Peruuta")').click();
    await expect(page.locator('h3:has-text("Siirrä lanka")')).not.toBeVisible();
  });

  test('can move thread to different category', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to test thread
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Open move modal
    await page.locator('[data-testid="thread-menu-button"]').click();
    await page.locator('[data-testid="move-thread-button"]').click();
    await expect(page.locator('h3:has-text("Siirrä lanka")')).toBeVisible();

    // Select target category
    await page
      .locator('[data-testid="category-select"]')
      .selectOption({ label: moveTargetCategoryName });

    // Confirm move
    await page.locator('[data-testid="confirm-move-button"]').click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify thread is now in the target category - navigate there to check
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${moveTargetCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Thread should be visible in target category
    await expect(
      page.locator(`ul button:has-text("${menuTestThreadName}")`)
    ).toBeVisible();

    // Verify thread is no longer in original category
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Thread should NOT be visible in original category
    await expect(
      page.locator(`ul button:has-text("${menuTestThreadName}")`)
    ).not.toBeVisible();
  });

  test('can delete thread via hamburger menu', async ({ page }) => {
    // First, create a new thread specifically for deletion test
    const deleteTestThreadName = `Delete Test Thread ${timestamp}`;

    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Navigate to subcategory
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Create thread for deletion
    await page.locator('button:has-text("Luo uusi lanka")').click();
    const inputs = await page.locator('input#name').all();
    await inputs[0].fill(deleteTestThreadName);
    await inputs[1].fill('Content to be deleted');
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi lanka")')
    ).not.toBeVisible();

    // Navigate to the thread
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestCategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${menuTestSubcategoryName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .locator(`ul button:has-text("${deleteTestThreadName}")`)
      .first()
      .click();
    await page.waitForLoadState('networkidle');

    // Set up dialog handler to accept confirmation
    page.on('dialog', (dialog) => dialog.accept());

    // Open menu and click delete
    await page.locator('[data-testid="thread-menu-button"]').click();
    await page.locator('[data-testid="delete-thread-button"]').click();

    // Wait for navigation back to parent category
    await page.waitForLoadState('networkidle');

    // Verify thread is deleted
    await expect(
      page.locator(`ul button:has-text("${deleteTestThreadName}")`)
    ).not.toBeVisible();
  });
});
