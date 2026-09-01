/**
 * Jest setup file for unit tests.
 *
 * Note: Environment variables are loaded and configured by tests/run-unit-tests.js
 * wrapper script before Jest starts, so DATABASE_URL is already set correctly.
 */

import '@testing-library/jest-dom';

// jsdom (the test environment jest-prisma runs on) doesn't implement
// `setImmediate`, which winston's console transport relies on when tests
// exercise code paths that log (e.g. the telegram provider's `profile()`).
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((fn: (...args: unknown[]) => void, ...args) =>
    global.setTimeout(fn, 0, ...args)) as unknown as typeof setImmediate;
}
