/** @type {import('jest').Config} */
export default {
  // Use SWC transformer for TypeScript and JavaScript
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          target: 'es2021',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          baseUrl: '.',
          paths: {
            '~/*': ['./src/*'],
          },
        },
      },
    ],
    '^.+\\.mjs$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'ecmascript',
          },
          target: 'es2021',
        },
      },
    ],
  },

  // Test environment for Prisma transaction rollback
  testEnvironment: '@quramy/jest-prisma/environment',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // Test file patterns - only look in tests/unit
  testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],

  // Module path aliases (matching tsconfig.json)
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^next-auth$': '<rootDir>/tests/__mocks__/next-auth.ts',
    '^next-auth/(.*)$': '<rootDir>/tests/__mocks__/next-auth.ts',
    '^@next-auth/prisma-adapter$':
      '<rootDir>/tests/__mocks__/@next-auth/prisma-adapter.ts',
  },

  // Coverage configuration
  collectCoverage: true,
  coverageProvider: 'v8', // Use V8 coverage for consistency with Playwright
  coverageDirectory: 'coverage-jest',
  coverageReporters: ['json', 'lcov', 'text', 'json-summary', 'html'],

  // What to include in coverage
  collectCoverageFrom: [
    'src/server/**/*.{ts,tsx}',
    '!src/server/**/*.test.ts',
    '!src/server/**/*.spec.ts',
    '!**/*.d.ts',
  ],

  // Setup files - run after the test environment is set up
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],

  // Don't transform node_modules except specific ESM packages
  transformIgnorePatterns: [
    'node_modules/(?!(superjson|jose|openid-client|oauth4webapi|@panva|date-fns|date-fns-tz)/)',
  ],

  // Increase timeout for database operations
  testTimeout: 30000,
};
