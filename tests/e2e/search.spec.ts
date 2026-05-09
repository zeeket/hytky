import { test, expect } from './fixtures/authenticated';

/**
 * Search Tests
 *
 * Tests for the forum search box that searches categories and threads.
 * Data is created fresh per suite using unique timestamps to avoid collisions.
 */

test.describe.serial('Search', () => {
  test.setTimeout(60000);

  // Unique names so parallel workers and retries never collide.
  const ts = Date.now();
  const searchCategoryName = `Search Cat ${ts}`;
  const searchSubcategoryName = `Search Sub ${ts}`;
  const searchThreadName = `Search Thread ${ts}`;
  const searchThreadContent = `Content for search thread ${ts}`;

  // Seed: create a category hierarchy and a thread before testing search.
  test('setup: create test category, subcategory, and thread', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Create top-level category
    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await page.locator('input#name').fill(searchCategoryName);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();

    // Navigate into it and create subcategory
    await page.goto(`/forum/${encodeURIComponent(searchCategoryName)}`);
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Luo uusi kategoria")').click();
    await page.locator('input#name').fill(searchSubcategoryName);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi kategoria")')
    ).not.toBeVisible();

    // Navigate into subcategory and create thread
    await page.goto(
      `/forum/${encodeURIComponent(searchCategoryName)}/${encodeURIComponent(searchSubcategoryName)}`
    );
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Luo uusi lanka")').click();
    const inputs = await page.locator('input#name').all();
    await inputs[0]!.fill(searchThreadName);
    await inputs[1]!.fill(searchThreadContent);
    await page.locator('button.bg-red-600:has-text("Luo")').click();
    await expect(
      page.locator('h4:has-text("Luo uusi lanka")')
    ).not.toBeVisible();
  });

  test('search box is visible on the forum page', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('dropdown is hidden when input is empty', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').click();

    await expect(
      page.locator('[data-testid="search-dropdown"]')
    ).not.toBeVisible();
  });

  test('dropdown appears after typing 2+ characters', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').fill('Se');

    await expect(page.locator('[data-testid="search-dropdown"]')).toBeVisible({
      timeout: 2000,
    });
  });

  test('finds the created category by partial name', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // Use a unique fragment from the category name (includes timestamp)
    const fragment = `Search Cat ${ts}`;
    await page.locator('[data-testid="search-input"]').fill(fragment);

    // Wait for dropdown with results
    await expect(
      page.locator('[data-testid="search-result"]').first()
    ).toBeVisible({
      timeout: 5000,
    });

    const categoryResult = page
      .locator('[data-testid="search-result"][data-result-type="category"]')
      .filter({ hasText: searchCategoryName });
    await expect(categoryResult).toBeVisible();
  });

  test('finds the created subcategory by partial name', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    const fragment = `Search Sub ${ts}`;
    await page.locator('[data-testid="search-input"]').fill(fragment);

    const subcategoryResult = page
      .locator('[data-testid="search-result"][data-result-type="category"]')
      .filter({ hasText: searchSubcategoryName });
    await expect(subcategoryResult).toBeVisible({ timeout: 5000 });
  });

  test('finds the created thread by partial name', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    const fragment = `Search Thread ${ts}`;
    await page.locator('[data-testid="search-input"]').fill(fragment);

    const threadResult = page
      .locator('[data-testid="search-result"][data-result-type="thread"]')
      .filter({ hasText: searchThreadName });
    await expect(threadResult).toBeVisible({ timeout: 5000 });
  });

  test('shows no-results message for an unmatched query', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page
      .locator('[data-testid="search-input"]')
      .fill('zzz-totally-unmatched-xqz');

    await expect(page.locator('[data-testid="search-no-results"]')).toBeVisible(
      { timeout: 5000 }
    );
  });

  test('clicking a category result navigates to that category', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').fill(`Search Cat ${ts}`);

    const categoryResult = page
      .locator('[data-testid="search-result"][data-result-type="category"]')
      .filter({ hasText: searchCategoryName });
    await expect(categoryResult).toBeVisible({ timeout: 5000 });
    await categoryResult.click();

    await page.waitForLoadState('networkidle');

    // We should land in the category — breadcrumb shows it
    await expect(page.locator(`text="${searchCategoryName}"`)).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(encodeURIComponent(searchCategoryName))
    );
  });

  test('clicking a thread result navigates to that thread', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page
      .locator('[data-testid="search-input"]')
      .fill(`Search Thread ${ts}`);

    const threadResult = page
      .locator('[data-testid="search-result"][data-result-type="thread"]')
      .filter({ hasText: searchThreadName });
    await expect(threadResult).toBeVisible({ timeout: 5000 });
    await threadResult.click();

    await page.waitForLoadState('networkidle');

    // Should be on the thread page
    await expect(
      page.locator(`h2:has-text("Lanka: ${searchThreadName}")`)
    ).toBeVisible();
  });

  test('pressing Escape closes the dropdown', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').fill('Se');
    await expect(page.locator('[data-testid="search-dropdown"]')).toBeVisible({
      timeout: 2000,
    });

    await page.keyboard.press('Escape');

    await expect(
      page.locator('[data-testid="search-dropdown"]')
    ).not.toBeVisible();
  });

  test('clicking outside the search box closes the dropdown', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').fill('Se');
    await expect(page.locator('[data-testid="search-dropdown"]')).toBeVisible({
      timeout: 2000,
    });

    // Click somewhere outside the search container
    await page.locator('h1:has-text("Foorumi")').click();

    await expect(
      page.locator('[data-testid="search-dropdown"]')
    ).not.toBeVisible();
  });

  test('keyboard navigation selects and navigates to a result', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page
      .locator('[data-testid="search-input"]')
      .fill(`Search Thread ${ts}`);

    await expect(
      page.locator('[data-testid="search-result"]').first()
    ).toBeVisible({
      timeout: 5000,
    });

    // Arrow down to first result, then Enter
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForLoadState('networkidle');

    // Should have navigated somewhere (URL changed from /forum)
    await expect(page).not.toHaveURL('/forum');
  });

  test('finds a thread by post content and shows a snippet', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    // searchThreadContent is the initial post created with the thread.
    // Use a substring that includes the timestamp so it won't match stale data.
    const fragment = `for search thread ${ts}`;
    await page.locator('[data-testid="search-input"]').fill(fragment);

    const postResult = page
      .locator('[data-testid="search-result"][data-result-type="post"]')
      .filter({ hasText: searchThreadName });
    await expect(postResult).toBeVisible({ timeout: 5000 });

    // The snippet should be visible inside the result button
    await expect(postResult).toContainText(fragment);
  });

  test('clicking a post result navigates to the thread', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    const fragment = `for search thread ${ts}`;
    await page.locator('[data-testid="search-input"]').fill(fragment);

    const postResult = page
      .locator('[data-testid="search-result"][data-result-type="post"]')
      .filter({ hasText: searchThreadName });
    await expect(postResult).toBeVisible({ timeout: 5000 });
    await postResult.click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.locator(`h2:has-text("Lanka: ${searchThreadName}")`)
    ).toBeVisible();
  });

  test('input is cleared and dropdown closes after navigation', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="search-input"]').fill(`Search Cat ${ts}`);

    const result = page
      .locator('[data-testid="search-result"][data-result-type="category"]')
      .filter({ hasText: searchCategoryName });
    await expect(result).toBeVisible({ timeout: 5000 });
    await result.click();

    // Wait for the router.push to actually complete (SPA nav has no network
    // requests, so networkidle resolves before pushState finishes).
    await page.waitForURL(new RegExp(encodeURIComponent(searchCategoryName)));

    // Navigate back and check the input is cleared
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    await expect(
      page.locator('[data-testid="search-dropdown"]')
    ).not.toBeVisible();
  });
});
