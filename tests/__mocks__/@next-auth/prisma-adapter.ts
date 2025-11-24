/**
 * Mock for @next-auth/prisma-adapter
 *
 * This is imported by src/server/auth.ts but we don't need it for unit tests.
 */

export const PrismaAdapter = jest.fn((_prisma) => ({
  createUser: jest.fn(),
  getUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByAccount: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  linkAccount: jest.fn(),
  unlinkAccount: jest.fn(),
  createSession: jest.fn(),
  getSessionAndUser: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  createVerificationToken: jest.fn(),
  useVerificationToken: jest.fn(),
}));
