import { type Page, type Coverage } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const COVERAGE_DIR = join(process.cwd(), '.nyc_output');
const SOURCES_DIR = join(COVERAGE_DIR, 'sources');

/**
 * Coverage helper for Playwright tests
 *
 * Collects V8 coverage from Chromium browser during test execution.
 * Coverage is collected from bundled JavaScript files served by Next.js.
 *
 * Note: This collects browser-side execution coverage. For server-side
 * coverage, you would need a separate Node.js instrumentation approach.
 */
export class CoverageHelper {
  private coverageStarted = false;

  /**
   * Start collecting JS coverage (Chromium only)
   *
   * Playwright's coverage API is only available in Chromium.
   * Firefox and WebKit tests will skip coverage collection.
   */
  async startCoverage(page: Page, browserName: string): Promise<void> {
    if (browserName !== 'chromium') {
      return;
    }

    try {
      await page.coverage.startJSCoverage({
        resetOnNavigation: false, // Keep coverage across page navigations
      });
      this.coverageStarted = true;
    } catch (error) {
      console.warn('[Coverage] Failed to start coverage:', error);
    }
  }

  /**
   * Stop collecting coverage and save to disk
   *
   * Coverage is saved in V8 format to .nyc_output/ directory.
   * Source files are downloaded and saved locally so c8 can access them.
   * Use c8 to generate reports from the saved coverage data.
   */
  async stopCoverage(
    page: Page,
    browserName: string,
    testName: string
  ): Promise<void> {
    if (browserName !== 'chromium' || !this.coverageStarted) {
      return;
    }

    try {
      const coverage = await page.coverage.stopJSCoverage();

      // Filter to keep only application code (exclude external resources)
      const filteredCoverage = coverage.filter((entry) => {
        const url = entry.url;
        return (
          (url.includes('dev.docker.orb.local') ||
            url.includes('localhost') ||
            url.includes('127.0.0.1')) &&
          !url.includes('chrome-extension://')
        );
      });

      if (filteredCoverage.length > 0) {
        await this.saveCoverage(page, filteredCoverage, testName);
      }

      this.coverageStarted = false;
    } catch (error) {
      console.warn('[Coverage] Failed to stop coverage:', error);
    }
  }

  /**
   * Download source file from URL and save it locally
   * Returns the local file path
   */
  private async downloadSource(page: Page, url: string): Promise<string> {
    try {
      // Extract meaningful path from URL (e.g., "/_next/static/chunks/pages/index.js")
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Create a safe filename by replacing slashes with underscores
      // Remove leading slash and replace remaining slashes
      const safeName = pathname.substring(1).replace(/\//g, '_');

      // Add hash suffix to ensure uniqueness (use short hash)
      const hash = createHash('md5').update(url).digest('hex').substring(0, 8);
      const filename = `${safeName}_${hash}.js`;
      const localPath = join(SOURCES_DIR, filename);

      // Only download if not already exists
      if (!existsSync(localPath)) {
        if (!existsSync(SOURCES_DIR)) {
          mkdirSync(SOURCES_DIR, { recursive: true });
        }

        // Fetch the source file (ignore HTTPS errors for self-signed certs in dev)
        const response = await page.context().request.get(url, {
          ignoreHTTPSErrors: true,
        });
        const content = await response.text();

        writeFileSync(localPath, content);
      }

      return localPath;
    } catch (error) {
      console.warn(`[Coverage] Failed to download source: ${url}`, error);
      return url; // Fallback to original URL
    }
  }

  /**
   * Save coverage to .nyc_output directory in V8 format
   * Downloads source files and transforms URLs to local paths for c8
   */
  private async saveCoverage(
    page: Page,
    coverage: Coverage.JSCoverageEntry[],
    testName: string
  ): Promise<void> {
    if (!existsSync(COVERAGE_DIR)) {
      mkdirSync(COVERAGE_DIR, { recursive: true });
    }

    // Download all source files and transform URLs
    const transformedCoverage = await Promise.all(
      coverage.map(async (entry) => {
        const localPath = await this.downloadSource(page, entry.url);
        return {
          scriptId: '0',
          url: localPath,
          functions: entry.functions || [],
        };
      })
    );

    const sanitizedTestName = testName
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `coverage_${sanitizedTestName}_${timestamp}.json`;
    const filepath = join(COVERAGE_DIR, filename);

    // V8 coverage format for c8
    const v8Coverage = {
      result: transformedCoverage,
    };

    writeFileSync(filepath, JSON.stringify(v8Coverage, null, 2));
  }
}
