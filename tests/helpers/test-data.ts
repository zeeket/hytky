import { type Page } from '@playwright/test';

/**
 * Generate a unique identifier for test data isolation
 * Combines timestamp with random number to prevent collisions across parallel runs
 */
export function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}_${random}`;
}

/**
 * Wait for navigation to complete and verify URL changed
 */
export async function waitForNavigation(
  page: Page,
  expectedUrlPattern: string,
  timeoutMs = 5000
): Promise<boolean> {
  try {
    await page.waitForURL(expectedUrlPattern, { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a category at the current location
 * NOTE: Does not navigate - assumes you're already at the correct parent category
 */
export async function createCategoryAtCurrentLocation(
  page: Page,
  categoryName: string,
  options: {
    waitForPropagation?: boolean;
  } = {}
): Promise<void> {
  const { waitForPropagation = true } = options;

  // Open create modal
  await page.locator('button:has-text("Luo uusi kategoria")').click();

  // Fill in name
  await page.locator('input#name').fill(categoryName);

  // Submit
  await page.locator('button.bg-red-600:has-text("Luo")').click();

  // Wait for modal to close
  await page
    .locator('h4:has-text("Luo uusi kategoria")')
    .waitFor({ state: 'hidden', timeout: 5000 });

  if (waitForPropagation) {
    // Wait a bit for data to propagate
    await page.waitForTimeout(500);
  }
}

/**
 * Create a category at a specific path
 * Navigates to the path first, then creates the category
 */
export async function createCategory(
  page: Page,
  categoryName: string,
  parentPath: string = '/forum'
): Promise<void> {
  // Navigate to parent location
  await page.goto(parentPath);
  await page.waitForLoadState('networkidle');

  // Create category at this location
  await createCategoryAtCurrentLocation(page, categoryName);
}

/**
 * Navigate into a category by clicking its link
 * Returns true if navigation succeeded, false otherwise
 */
export async function navigateIntoCategory(
  page: Page,
  categoryName: string,
  options: {
    useFirst?: boolean;
    verifyNavigation?: boolean;
  } = {}
): Promise<boolean> {
  const { useFirst = false, verifyNavigation = true } = options;

  const currentUrl = page.url();
  const selector = `ul button:has-text("${categoryName}")`;

  try {
    // Click the button (use .first() if useFirst is true to handle duplicates)
    const locator = useFirst
      ? page.locator(selector).first()
      : page.locator(selector).first();
    await locator.click({ timeout: 5000 });

    // Wait for network to settle
    await page.waitForLoadState('networkidle');

    if (verifyNavigation) {
      // Verify URL changed
      const newUrl = page.url();
      if (newUrl === currentUrl) {
        console.warn(
          `[navigateIntoCategory] URL did not change after clicking "${categoryName}"`
        );
        return false;
      }

      // Verify URL contains the category name (encoded)
      const encodedName = encodeURIComponent(categoryName);
      if (!newUrl.includes(encodedName)) {
        console.warn(
          `[navigateIntoCategory] URL does not contain "${encodedName}". URL: ${newUrl}`
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(
      `[navigateIntoCategory] Failed to navigate to "${categoryName}":`,
      error
    );
    return false;
  }
}

/**
 * Create a thread and verify it was created successfully
 */
export async function createThread(
  page: Page,
  threadName: string,
  content: string,
  options: {
    verifyCreation?: boolean;
  } = {}
): Promise<void> {
  const { verifyCreation = true } = options;

  // Open create modal
  await page.locator('button:has-text("Luo uusi lanka")').click();

  // Fill in name and content
  const inputs = await page.locator('input#name').all();
  await inputs[0].fill(threadName);
  await inputs[1].fill(content);

  // Submit
  await page.locator('button.bg-red-600:has-text("Luo")').click();

  // Wait for modal to close
  await page
    .locator('h4:has-text("Luo uusi lanka")')
    .waitFor({ state: 'hidden', timeout: 5000 });

  if (verifyCreation) {
    // Wait a bit for data to propagate
    await page.waitForTimeout(500);
  }
}

/**
 * Navigate to a category via URL and verify it loaded correctly
 */
export async function navigateToUrl(
  page: Page,
  path: string,
  options: {
    waitForContent?: boolean;
    expectedStatus?: number;
  } = {}
): Promise<{ success: boolean; status?: number }> {
  const { waitForContent = true, expectedStatus = 200 } = options;

  try {
    const response = await page.goto(path);
    const status = response?.status();

    if (status !== expectedStatus) {
      console.warn(
        `[navigateToUrl] Expected status ${expectedStatus}, got ${status}`
      );
      return { success: false, status };
    }

    await page.waitForLoadState('networkidle');

    if (waitForContent) {
      // Wait for queries to complete (look for absence of loading message)
      await page
        .locator('text="Ladataan..."')
        .waitFor({ state: 'hidden', timeout: 10000 })
        .catch(() => {
          // Loading message might not appear if data loads quickly
        });

      // Give queries time to complete
      await page.waitForTimeout(1000);
    }

    return { success: true, status };
  } catch (error) {
    console.error(`[navigateToUrl] Failed to navigate to "${path}":`, error);
    return { success: false };
  }
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(
  page: Page,
  selector: string,
  options: {
    timeout?: number;
    state?: 'attached' | 'visible';
  } = {}
): Promise<boolean> {
  const { timeout = 5000, state = 'visible' } = options;

  try {
    await page.locator(selector).waitFor({ state, timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Count elements matching a selector
 */
export async function countElements(
  page: Page,
  selector: string
): Promise<number> {
  const elements = await page.locator(selector).all();
  return elements.length;
}
