# HYTKY Forum Tests

## Overview

This directory contains end-to-end tests for the HYTKY forum application using Playwright. Tests use data isolation and parallel execution for fast, reliable testing.

## Test Status

**✅ 31 tests passing** | **⏭️ 12 tests skipped (deprecated)** | **📊 High coverage**

All forum functionality is tested and working, including URL navigation. The skipped tests are deprecated versions that relied on unreliable click navigation for setup.

## Test Files

### Active Test Suites ✅

- **forum.spec.ts** - Core forum functionality (viewing, creating categories/threads) - 21 tests
- **forum-url-navigation-v3.spec.ts** - URL-based navigation tests - 6 tests
- **forum-hierarchical-navigation-v3.spec.ts** - Hierarchical structure and duplicate name handling - 4 tests
- **index.spec.ts** - Homepage and authentication tests
- **rental.spec.ts** - Rental page navigation tests

### Deprecated Test Files ⏭️

- **forum-url-navigation.spec.ts** - DEPRECATED, use v3 version
- **forum-hierarchical-navigation.spec.ts** - DEPRECATED, use v3 version

These were replaced because they relied on click navigation for setup, which proved unreliable. The v3 versions use URL-based navigation throughout.

## Running Tests

```bash
# Run all tests with coverage
make test

# Run specific test file
pnpm exec playwright test tests/forum-url-navigation-v3.spec.ts

# Run specific browser only
pnpm exec playwright test --project=chromium

# Run with UI (headed mode)
pnpm exec playwright test --headed

# View last test report
pnpm exec playwright show-report
```

## Test Configuration

Tests run **in parallel** for speed, with proper data isolation:

- `workers: auto` - Multiple workers based on CPU cores (2 on CI)
- `fullyParallel: true` - Tests run concurrently
- Each test uses unique identifiers to avoid conflicts
- Safe to run across multiple browsers simultaneously

## Test Documentation

See `tests/docs/` for detailed investigation history:

- **FINAL-INVESTIGATION.md** - Complete analysis proving URL navigation works correctly
- **MYSTERY-SOLVED.md** - Root cause analysis of original test failures
- **FIX-SUMMARY.md** - Summary of fixes implemented to tRPC and test infrastructure

## Test Architecture

### Data Isolation

All tests use unique identifiers to prevent conflicts:

```typescript
const uniqueId = generateUniqueId(); // e.g., "1762202162427_3986"
const categoryName = `TestCat_${uniqueId}`;
```

This allows tests to run in parallel safely across multiple workers and browsers.

### Test Helpers (`tests/helpers/test-data.ts`)

- **`generateUniqueId()`** - Generate unique test data identifiers
- **`createCategory(page, name, parentPath)`** - Create category at specific path
- **`createThread(page, name, content)`** - Create thread at current location
- **`navigateToUrl(page, path, options)`** - Navigate and verify success
- **`countElements(page, selector)`** - Count matching elements
- **`elementExists(page, selector)`** - Check element existence

### Why URL-Based Setup?

The v3 tests use URL navigation for setup instead of clicks because:

1. **More Reliable** - Direct URL navigation always works
2. **Tests Real Functionality** - Using URL navigation to test URL navigation
3. **Faster** - No waiting for UI animations
4. **Clearer** - Explicit URLs show exact hierarchy being created

## Investigation Summary

**The Mystery**: Original tests showed URL navigation "failing" with empty category lists

**The Reality**: URL navigation works perfectly! The issue was with the test setup:

- Tests used click navigation to create test data
- Clicks failed due to duplicate names across parallel test runs
- Data was created in wrong locations due to failed navigation
- This made URL navigation appear broken when it actually worked

**The Solution**: Refactored tests (v3) use URL navigation throughout, with unique identifiers for complete data isolation.

See `tests/docs/FINAL-INVESTIGATION.md` for complete analysis.

## Test Fixtures

### Helpers

- **helpers/test-session.ts** - Creates valid NextAuth session tokens for testing
- **fixtures/authenticated.ts** - Auto-injects authentication for all tests
- **fixtures/coverage.ts** - Enables code coverage collection

### Authentication

Tests use a pre-configured test user (ID: 999999999) that's seeded via `prisma/seed.ts`. Authentication is handled automatically via JWT tokens, bypassing the Telegram OAuth flow.
