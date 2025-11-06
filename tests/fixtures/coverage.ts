import { test as base } from '@playwright/test';
import { CoverageHelper } from '../helpers/coverage';

type CoverageFixture = {
  _autoRunCoverage: void;
};

export const test = base.extend<CoverageFixture>({
  _autoRunCoverage: [async ({ page, browserName }, use, testInfo) => {
    const helper = new CoverageHelper();

    // Start coverage before test
    await helper.startCoverage(page, browserName);

    // Run test
    await use();

    // Stop coverage after test
    await helper.stopCoverage(page, browserName, testInfo.title);
  }, { auto: true }],
});

export { expect } from '@playwright/test';
