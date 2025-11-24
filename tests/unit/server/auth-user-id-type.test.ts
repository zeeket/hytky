import { authOptions } from '~/server/auth';
import type { JWT } from 'next-auth/jwt';

/**
 * User ID Type Consistency Test
 *
 * This test verifies that user IDs are consistently handled as strings throughout
 * the authentication flow, matching the Prisma schema where User.id is String.
 *
 * The issue: TypeScript interfaces declare user.id as number, but Prisma schema
 * defines it as String. This causes type mismatches and requires .toString() calls.
 */
describe('User ID type consistency', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaClient = (global as any).jestPrisma.client;

  describe('session user ID type', () => {
    it('should have session.user.id as string matching database User.id type', async () => {
      // Create a user in the database with a string ID (as per Prisma schema)
      const dbUser = await prismaClient.user.create({
        data: {
          id: 'test-user-string-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      // Verify the database user ID is a string
      expect(typeof dbUser.id).toBe('string');
      expect(dbUser.id).toBe('test-user-string-id');

      // Simulate the authorize function returning a user object
      // In the real flow, authorize should return the DB user's string ID
      const mockUser = {
        id: dbUser.id, // This should be a string, not a number
        name: dbUser.name || '',
        image: '',
        role: 'active' as const,
      };

      // Simulate JWT callback
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) {
        throw new Error('JWT callback not found');
      }

      const token = (await jwtCallback({
        token: {} as JWT,
        user: mockUser,
        account: null,
        profile: null,
        isNewUser: false,
        trigger: 'signIn',
      })) as JWT;

      // Verify token.userId is a string (should match database type)
      expect(typeof token.userId).toBe('string');
      expect(token.userId).toBe(dbUser.id);

      // Simulate session callback
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error('Session callback not found');
      }

      const session = await sessionCallback({
        session: {
          user: {
            id: '', // Will be set by callback
            name: dbUser.name || '',
            email: dbUser.email || '',
            image: null,
          },
          expires: new Date().toISOString(),
        },
        token,
        user: mockUser,
      });

      // Verify session.user.id is a string and matches database ID
      expect(session.user).toBeDefined();
      expect(typeof session.user.id).toBe('string');
      expect(session.user.id).toBe(dbUser.id);

      // Verify we can use the session ID directly in database operations
      // without needing .toString()
      const category = await prismaClient.category.create({
        data: {
          name: 'Test Category',
          createdById: session.user.id, // Should work directly as string
        },
      });

      expect(category.createdById).toBe(dbUser.id);
      expect(category.createdById).toBe(session.user.id);
    });

    it('should handle user ID from Telegram login correctly', async () => {
      // Simulate Telegram user data (Telegram provides numeric IDs)
      const telegramUserId = 123456789;
      const telegramUserStringId = telegramUserId.toString();

      // Create user in database with string ID (as Prisma requires)
      const dbUser = await prismaClient.user.upsert({
        where: { id: telegramUserStringId },
        update: { name: 'Telegram User' },
        create: {
          id: telegramUserStringId,
          name: 'Telegram User',
        },
      });

      // The authorize function should return the DB user's string ID, not the Telegram number
      const mockUser = {
        id: dbUser.id, // String ID from database, not telegramUserId
        name: dbUser.name || '',
        image: '',
        role: 'active' as const,
      };

      // Verify the returned user has string ID
      expect(typeof mockUser.id).toBe('string');
      expect(mockUser.id).toBe(telegramUserStringId);
      expect(mockUser.id).not.toBe(telegramUserId); // Should be string, not number

      // Test the full flow
      const jwtCallback = authOptions.callbacks?.jwt;
      const sessionCallback = authOptions.callbacks?.session;

      if (!jwtCallback || !sessionCallback) {
        throw new Error('Callbacks not found');
      }

      const token = (await jwtCallback({
        token: {} as JWT,
        user: mockUser,
        account: null,
        profile: null,
        isNewUser: false,
        trigger: 'signIn',
      })) as JWT;

      const session = await sessionCallback({
        session: {
          user: {
            id: '',
            name: mockUser.name,
            email: null,
            image: null,
          },
          expires: new Date().toISOString(),
        },
        token,
        user: mockUser,
      });

      // Verify the session ID is a string and can be used directly
      expect(session.user).toBeDefined();
      expect(typeof session.user.id).toBe('string');

      // Create a category and thread to test database operations
      const category = await prismaClient.category.create({
        data: {
          name: 'Test Category',
          createdById: session.user.id, // Direct use, no .toString() needed
        },
      });

      const thread = await prismaClient.thread.create({
        data: {
          name: 'Test Thread',
          categoryId: category.id,
          authorId: session.user.id, // Direct use, no .toString() needed
        },
      });

      // Verify it works in database operations without conversion
      const post = await prismaClient.post.create({
        data: {
          content: 'Test post',
          authorId: session.user.id, // Direct use, no .toString() needed
          threadId: thread.id,
        },
      });

      expect(post.authorId).toBe(telegramUserStringId);
      expect(post.authorId).toBe(session.user.id);
    });
  });
});
