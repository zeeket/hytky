#!/usr/bin/env node

/**
 * Wrapper script to run Jest unit tests with proper DATABASE_URL configuration.
 *
 * This script:
 * 1. Loads environment variables from .env files (same as Next.js)
 * 2. Converts DATABASE_URL from docker network name to localhost for host-based testing
 * 3. Runs Jest with the modified environment
 */

const { loadEnvConfig } = require('@next/env');
const { spawn } = require('child_process');

// Load environment variables from .env files
loadEnvConfig(process.cwd());

// Convert postgres docker network name to localhost for host-based tests
if (process.env.DATABASE_URL?.includes('postgres:5432')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    'postgres:5432',
    'localhost:5432'
  );
}

// Run Jest with all arguments passed to this script
const jestArgs = process.argv.slice(2);
const jest = spawn('jest', jestArgs, {
  stdio: 'inherit',
  env: process.env,
});

jest.on('exit', (code) => {
  process.exit(code);
});
