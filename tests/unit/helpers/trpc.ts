import { type Session } from 'next-auth';
import { appRouter } from '~/server/api/root';

/**
 * Create a tRPC caller for testing with optional session.
 *
 * This creates a context with the jest-prisma client for automatic transaction rollback.
 *
 * @param session - Optional session object for authenticated tests
 * @returns A tRPC caller that can invoke procedures directly
 *
 * @example
 * // Test unauthenticated endpoint
 * const caller = createTestCaller();
 * const result = await caller.category.getAllCategories();
 *
 * @example
 * // Test authenticated endpoint
 * const session = createMockSession();
 * const caller = createTestCaller(session);
 * const result = await caller.category.getRootCategory();
 */
export const createTestCaller = (session: Session | null = null) => {
  // Use jestPrisma.client for automatic transaction rollback
  const ctx = {
    session,
    prisma: jestPrisma.client,
    req: undefined,
  };
  return appRouter.createCaller(ctx);
};

/**
 * Create a mock authenticated session for testing.
 *
 * @param overrides - Optional partial session to override defaults
 * @returns A complete mock session object
 *
 * @example
 * const session = createMockSession({ user: { id: 'custom-id' } });
 */
export const createMockSession = (overrides?: Partial<Session>): Session => {
  return {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: '',
      role: 'active',
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
};
