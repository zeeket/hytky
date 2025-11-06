#!/usr/bin/env node

/**
 * Uncovered Lines Reporter
 *
 * Parses lcov.info and displays files with uncovered lines
 * in a compact format: filename: line-ranges
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
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

/**
 * Group consecutive numbers into ranges
 * [1,2,3,5,6,8] => ["1-3", "5-6", "8"]
 */
function groupIntoRanges(numbers) {
  if (numbers.length === 0) return [];

  const sorted = [...numbers].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return ranges;
}

/**
 * Parse lcov.info to extract uncovered lines
 */
function parseUncoveredLines(lcovPath) {
  if (!fs.existsSync(lcovPath)) {
    console.error(`${colors.red}✗ lcov.info not found at: ${lcovPath}${colors.reset}`);
    return null;
  }

  const content = fs.readFileSync(lcovPath, 'utf8');
  const lines = content.split('\n');

  const filesWithUncovered = [];
  let currentFile = null;
  let uncoveredLines = [];

  for (const line of lines) {
    if (line.startsWith('SF:')) {
      // Save previous file if it had uncovered lines
      if (currentFile && uncoveredLines.length > 0) {
        filesWithUncovered.push({
          path: currentFile,
          filename: path.basename(currentFile),
          uncoveredLines: [...uncoveredLines],
        });
      }

      currentFile = line.substring(3);
      uncoveredLines = [];
    } else if (line.startsWith('DA:')) {
      // DA:line_number,execution_count
      const match = line.match(/^DA:(\d+),(\d+)/);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const execCount = parseInt(match[2], 10);
        if (execCount === 0) {
          uncoveredLines.push(lineNum);
        }
      }
    }
  }

  // Don't forget the last file
  if (currentFile && uncoveredLines.length > 0) {
    filesWithUncovered.push({
      path: currentFile,
      filename: path.basename(currentFile),
      uncoveredLines: [...uncoveredLines],
    });
  }

  return filesWithUncovered;
}

/**
 * Main function
 */
function main() {
  const projectRoot = path.join(path.dirname(__dirname), '..');
  const lcovPath = path.join(projectRoot, 'coverage', 'lcov.info');

  const filesWithUncovered = parseUncoveredLines(lcovPath);

  if (!filesWithUncovered) {
    process.exit(1);
  }

  if (filesWithUncovered.length === 0) {
    console.log(`${colors.bold}✅ All lines covered!${colors.reset}`);
    return;
  }

  console.log(`${colors.bold}Uncovered Lines:${colors.reset}`);
  console.log('');

  for (const file of filesWithUncovered) {
    const ranges = groupIntoRanges(file.uncoveredLines);
    const rangeStr = ranges.join(', ');
    console.log(`${file.filename}: ${rangeStr}`);
  }

  console.log('');
}

main();
