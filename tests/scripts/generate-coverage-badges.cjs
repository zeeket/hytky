#!/usr/bin/env node

/**
 * Generate shields.io endpoint JSON files for coverage and test count badges.
 *
 * This script:
 * 1. Reads coverage-summary.json from Jest and Playwright reports
 * 2. Reads test results JSON from Jest and Playwright
 * 3. Extracts statement coverage percentages and test counts
 * 4. Generates shields.io endpoint JSON files
 * 5. Saves to .github/badges/ directory
 */

const fs = require('fs');
const path = require('path');

const BADGES_DIR = path.join(process.cwd(), '.github', 'badges');

// Create badges directory if it doesn't exist
if (!fs.existsSync(BADGES_DIR)) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
}

/**
 * Get color for coverage percentage
 */
/**
 * @param {number} percentage
 */
function getCoverageColor(percentage) {
  if (percentage >= 90) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 70) return 'yellowgreen';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 50) return 'orange';
  return 'red';
}

/**
 * Create shields.io endpoint JSON
 */
/**
 * @param {string} label
 * @param {number} percentage
 */
function createBadge(label, percentage) {
  const color = getCoverageColor(percentage);
  return {
    schemaVersion: 1,
    label: label,
    message: `${percentage.toFixed(1)}%`,
    color: color,
  };
}

/**
 * Extract coverage from Jest report
 */
function getJestCoverage() {
  const jestSummaryPath = path.join(
    process.cwd(),
    'coverage-jest',
    'coverage-summary.json'
  );

  if (!fs.existsSync(jestSummaryPath)) {
    console.warn('Jest coverage summary not found, skipping...');
    return null;
  }

  try {
    const summary = JSON.parse(fs.readFileSync(jestSummaryPath, 'utf8'));
    const total = summary.total;
    return total.statements.pct;
  } catch (error) {
    console.error(
      'Error reading Jest coverage:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Extract coverage from Playwright report (c8)
 */
function getPlaywrightCoverage() {
  const playwrightSummaryPath = path.join(
    process.cwd(),
    'coverage',
    'coverage-summary.json'
  );

  if (!fs.existsSync(playwrightSummaryPath)) {
    console.warn('Playwright coverage summary not found, skipping...');
    return null;
  }

  try {
    const summary = JSON.parse(fs.readFileSync(playwrightSummaryPath, 'utf8'));
    const total = summary.total;
    return total.statements.pct;
  } catch (error) {
    console.error(
      'Error reading Playwright coverage:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Extract test counts from Jest results
 * @returns {{ passed: number, total: number } | null}
 */
function getJestTestCounts() {
  const jestResultsPath = path.join(
    process.cwd(),
    'coverage-jest',
    'test-results.json'
  );

  if (!fs.existsSync(jestResultsPath)) {
    console.warn('Jest test results not found, skipping...');
    return null;
  }

  try {
    const results = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
    return {
      passed: results.numPassedTests || 0,
      total: results.numTotalTests || 0,
    };
  } catch (error) {
    console.error(
      'Error reading Jest test results:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Extract test counts from Playwright results
 * @returns {{ passed: number, total: number } | null}
 */
function getPlaywrightTestCounts() {
  const playwrightResultsPath = path.join(
    process.cwd(),
    'playwright-report',
    'results.json'
  );

  if (!fs.existsSync(playwrightResultsPath)) {
    console.warn('Playwright test results not found, skipping...');
    return null;
  }

  try {
    const results = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
    const stats = results.stats || {};
    // Playwright stats: expected = passed, unexpected = failed, flaky, skipped
    const passed = stats.expected || 0;
    const failed = stats.unexpected || 0;
    const flaky = stats.flaky || 0;
    const skipped = stats.skipped || 0;
    const total = passed + failed + flaky + skipped;
    return {
      passed: passed + flaky, // Count flaky as passed (they eventually passed)
      total,
    };
  } catch (error) {
    console.error(
      'Error reading Playwright test results:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Get color for test results
 * @param {number} passed
 * @param {number} total
 */
function getTestColor(passed, total) {
  if (total === 0) return 'lightgrey';
  const ratio = passed / total;
  if (ratio === 1) return 'brightgreen';
  if (ratio >= 0.9) return 'green';
  if (ratio >= 0.7) return 'yellow';
  return 'red';
}

/**
 * Create shields.io endpoint JSON for test counts
 * @param {string} label
 * @param {number} passed
 * @param {number} total
 */
function createTestBadge(label, passed, total) {
  const color = getTestColor(passed, total);
  return {
    schemaVersion: 1,
    label: label,
    message: `${passed}/${total} passing`,
    color: color,
  };
}

/**
 * Calculate combined coverage (weighted average)
 */
/**
 * @param {number|null} jestPct
 * @param {number|null} playwrightPct
 */
function getCombinedCoverage(jestPct, playwrightPct) {
  if (jestPct === null && playwrightPct === null) return null;
  if (jestPct === null) return playwrightPct;
  if (playwrightPct === null) return jestPct;

  // Simple average (you could weight these differently if desired)
  return (jestPct + playwrightPct) / 2;
}

// Main execution
console.log('Generating coverage and test count badges...\n');

// Coverage badges
const jestCoverage = getJestCoverage();
const playwrightCoverage = getPlaywrightCoverage();
const combinedCoverage = getCombinedCoverage(jestCoverage, playwrightCoverage);

// Test count data
const jestTests = getJestTestCounts();
const playwrightTests = getPlaywrightTestCounts();

console.log('=== Coverage Badges ===');

// Generate Jest coverage badge
if (jestCoverage !== null) {
  const jestBadge = createBadge('server coverage', jestCoverage);
  fs.writeFileSync(
    path.join(BADGES_DIR, 'coverage-jest.json'),
    JSON.stringify(jestBadge, null, 2)
  );
  console.log(`✓ Jest (Server) Coverage: ${jestCoverage.toFixed(1)}%`);
}

// Generate Playwright coverage badge
if (playwrightCoverage !== null) {
  const playwrightBadge = createBadge('client coverage', playwrightCoverage);
  fs.writeFileSync(
    path.join(BADGES_DIR, 'coverage-playwright.json'),
    JSON.stringify(playwrightBadge, null, 2)
  );
  console.log(
    `✓ Playwright (Client) Coverage: ${playwrightCoverage.toFixed(1)}%`
  );
}

// Generate combined coverage badge
if (combinedCoverage !== null) {
  const combinedBadge = createBadge('coverage', combinedCoverage);
  fs.writeFileSync(
    path.join(BADGES_DIR, 'coverage-combined.json'),
    JSON.stringify(combinedBadge, null, 2)
  );
  console.log(`✓ Combined Coverage: ${combinedCoverage.toFixed(1)}%`);
}

console.log('\n=== Test Count Badges ===');

// Generate Jest test count badge
if (jestTests !== null) {
  const jestTestBadge = createTestBadge(
    'Jest',
    jestTests.passed,
    jestTests.total
  );
  fs.writeFileSync(
    path.join(BADGES_DIR, 'tests-jest.json'),
    JSON.stringify(jestTestBadge, null, 2)
  );
  console.log(`✓ Jest Tests: ${jestTests.passed}/${jestTests.total} passing`);
}

// Generate Playwright test count badge
if (playwrightTests !== null) {
  const playwrightTestBadge = createTestBadge(
    'Playwright',
    playwrightTests.passed,
    playwrightTests.total
  );
  fs.writeFileSync(
    path.join(BADGES_DIR, 'tests-playwright.json'),
    JSON.stringify(playwrightTestBadge, null, 2)
  );
  console.log(
    `✓ Playwright Tests: ${playwrightTests.passed}/${playwrightTests.total} passing`
  );
}

console.log('\nBadges saved to .github/badges/');
