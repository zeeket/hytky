#!/usr/bin/env node

/**
 * Generate shields.io endpoint JSON files for coverage badges.
 *
 * This script:
 * 1. Reads coverage-summary.json from Jest and Playwright reports
 * 2. Extracts statement coverage percentages
 * 3. Generates shields.io endpoint JSON files
 * 4. Saves to .github/badges/ directory
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
console.log('Generating coverage badges...\n');

const jestCoverage = getJestCoverage();
const playwrightCoverage = getPlaywrightCoverage();
const combinedCoverage = getCombinedCoverage(jestCoverage, playwrightCoverage);

// Generate Jest badge
if (jestCoverage !== null) {
  const jestBadge = createBadge('server coverage', jestCoverage);
  fs.writeFileSync(
    path.join(BADGES_DIR, 'coverage-jest.json'),
    JSON.stringify(jestBadge, null, 2)
  );
  console.log(`✓ Jest (Server) Coverage: ${jestCoverage.toFixed(1)}%`);
}

// Generate Playwright badge
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

// Generate combined badge
if (combinedCoverage !== null) {
  const combinedBadge = createBadge('coverage', combinedCoverage);
  fs.writeFileSync(
    path.join(BADGES_DIR, 'coverage-combined.json'),
    JSON.stringify(combinedBadge, null, 2)
  );
  console.log(`✓ Combined Coverage: ${combinedCoverage.toFixed(1)}%`);
}

console.log('\nBadges saved to .github/badges/');
