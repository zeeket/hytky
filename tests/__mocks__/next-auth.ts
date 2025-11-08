/**
 * Mock for next-auth module
 *
 * This mock is needed because next-auth imports ESM packages (jose, openid-client)
 * that Jest cannot transform by default. Since we don't need actual NextAuth
 * functionality in unit tests (we pass sessions directly to tRPC context),
 * we can safely mock it.
 */

// Mock the main exports from next-auth
export const getServerSession = jest.fn();
export const getSession = jest.fn();
export const getCsrfToken = jest.fn();
export const getProviders = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();
export const useSession = jest.fn();

// Mock CredentialsProvider (default export from next-auth/providers/credentials)
const CredentialsProvider = jest.fn((config) => ({
  ...config,
  type: 'credentials',
  id: config.id || 'credentials',
  name: config.name || 'Credentials',
}));

// This allows the mock to work both as named and default export
export default CredentialsProvider;

// Export types (these are just for TypeScript - no runtime impact)
export type NextAuthOptions = unknown;
export type DefaultSession = unknown;
export type Session = unknown;
export type User = unknown;
export type Account = unknown;
export type Profile = unknown;
