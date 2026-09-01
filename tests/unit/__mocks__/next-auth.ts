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

// Stand-in for the default export of `next-auth` and of its provider modules
// (`next-auth/providers/*`), which return their config unchanged.
const defaultExport = jest.fn((config) => config);

export default defaultExport;

// Export types (these are just for TypeScript - no runtime impact)
export type NextAuthOptions = unknown;
export type DefaultSession = unknown;
export type Session = unknown;
export type User = unknown;
export type Account = unknown;
export type Profile = unknown;
