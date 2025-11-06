#!/usr/bin/env node

/**
 * Coverage Summary Reporter
 *
 * Reads c8's JSON coverage summary and displays a formatted table
 * showing coverage percentages for key files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

/**
 * Get coverage color based on percentage
 */
function getCoverageColor(pct) {
  if (pct >= 90) return colors.green;
  if (pct >= 70) return colors.yellow;
  return colors.red;
}

/**
 * Get coverage emoji based on percentage
 */
function getCoverageEmoji(pct) {
  if (pct >= 90) return '✅';
  if (pct >= 70) return '⚠️ ';
  return '❌';
}

/**
 * Format coverage percentage with color
 */
function formatCoverage(pct) {
  const color = getCoverageColor(pct);
  const emoji = getCoverageEmoji(pct);
  return `${emoji} ${color}${pct.toFixed(2)}%${colors.reset}`;
}

/**
 * Extract meaningful file type from filename
 */
function getFileNote(filename) {
  if (filename.includes('pages_index')) return 'Main page';
  if (filename.includes('pages__app')) return 'App wrapper';
  if (filename.includes('pages_auth') || filename.includes('signin')) return 'Authentication';
  if (filename.includes('pages_rental')) return 'Rental page';
  if (filename.includes('pages_forum')) return 'Forum';
  if (filename.includes('pages_about')) return 'About page';
  if (filename.includes('pages_events')) return 'Events page';
  if (filename.includes('main.js')) return 'Core bundle';
  if (filename.includes('_app.js')) return 'App wrapper';
  if (filename.includes('webpack')) return 'Webpack runtime';
  if (filename.includes('react-refresh')) return 'HMR';
  if (filename.includes('buildManifest') || filename.includes('ssgManifest')) return 'Manifest';
  if (filename.includes('telegram') || filename.includes('embed')) return 'Telegram widget';
  return 'Bundle';
}

/**
 * Simplify filename for display
 */
function simplifyFilename(filename) {
  // Extract the meaningful part of the filename
  const match = filename.match(/pages_([^_]+)/);
  if (match) {
    return `pages/${match[1]}.js`;
  }

  if (filename.includes('main.js')) return 'main.js';
  if (filename.includes('_app.js')) return '_app.js';
  if (filename.includes('webpack')) return 'webpack.js';
  if (filename.includes('telegram') || filename.includes('embed')) return 'telegram-widget.js';

  // Fallback: take first 30 chars
  return filename.substring(0, 30) + (filename.length > 30 ? '...' : '');
}

/**
 * Main function
 */
function main() {
  // Go up two directories from tests/scripts/ to project root
  const projectRoot = path.join(path.dirname(__dirname), '..');
  const summaryPath = path.join(projectRoot, 'coverage', 'coverage-summary.json');

  if (!fs.existsSync(summaryPath)) {
    console.error(`${colors.red}✗ Coverage summary not found at: ${summaryPath}${colors.reset}`);
    console.error(`${colors.dim}Run tests with coverage first: pnpm run test:coverage${colors.reset}`);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  // Extract total coverage
  const total = summary.total;
  const totalPct = total.statements.pct;

  console.log('');
  console.log(`${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}  📊 Coverage Report${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  // Overall coverage
  console.log(`  ${colors.bold}Overall Coverage:${colors.reset} ${formatCoverage(totalPct)}`);
  console.log('');

  // Get all files except 'total'
  const files = Object.entries(summary)
    .filter(([path]) => path !== 'total')
    .map(([filepath, data]) => {
      const filename = path.basename(filepath);
      return {
        filepath,
        filename,
        simpleName: simplifyFilename(filename),
        note: getFileNote(filename),
        coverage: data.statements.pct,
        isPage: filename.includes('pages_'),
      };
    })
    // Prioritize page files and sort by coverage (lowest first to highlight issues)
    .sort((a, b) => {
      // Pages first
      if (a.isPage && !b.isPage) return -1;
      if (!a.isPage && b.isPage) return 1;
      // Then by coverage (ascending - show problems first)
      return a.coverage - b.coverage;
    })
    // Take top files
    .slice(0, 10);

  if (files.length === 0) {
    console.log(`  ${colors.dim}No coverage data available${colors.reset}`);
    console.log('');
    return;
  }

  // Table header
  console.log(`  ${colors.bold}┌${'─'.repeat(32)}┬${'─'.repeat(14)}┬${'─'.repeat(22)}┐${colors.reset}`);
  console.log(`  ${colors.bold}│ File${' '.repeat(27)}│ Coverage     │ Description          │${colors.reset}`);
  console.log(`  ${colors.bold}├${'─'.repeat(32)}┼${'─'.repeat(14)}┼${'─'.repeat(22)}┤${colors.reset}`);

  // Table rows
  files.forEach((file) => {
    const nameCell = file.simpleName.padEnd(30);
    const coverageCell = formatCoverage(file.coverage);
    const noteCell = file.note.padEnd(20);

    // Calculate padding for coverage (account for ANSI codes)
    const coveragePlain = `${getCoverageEmoji(file.coverage)} ${file.coverage.toFixed(2)}%`;
    const paddingNeeded = 12 - coveragePlain.length;

    console.log(`  │ ${nameCell} │ ${coverageCell}${' '.repeat(paddingNeeded)} │ ${noteCell} │`);
  });

  console.log(`  ${colors.bold}└${'─'.repeat(32)}┴${'─'.repeat(14)}┴${'─'.repeat(22)}┘${colors.reset}`);
  console.log('');
  console.log(`  ${colors.dim}View detailed report: ${colors.reset}${colors.cyan}coverage/index.html${colors.reset}`);
  console.log(`  ${colors.dim}Run: ${colors.reset}${colors.cyan}open coverage/index.html${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
}

main();
