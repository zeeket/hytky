import { TRPCError } from '@trpc/server';
import { createTestCaller, createMockSession } from '../../helpers/trpc';

/**
 * Post Router Unit Tests
 *
 * These tests use jest-prisma environment which automatically wraps each test
 * in a database transaction that gets rolled back after the test completes.
 * This ensures test isolation without manual cleanup.
 */
describe('postRouter', () => {
  // Access the Prisma client with automatic transaction rollback
  const prisma = jestPrisma.client;

  describe('createPost', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.post.createPost({
          content: 'Test post content',
          threadId: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should create a post when authenticated', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      // Create root category
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      // Create thread
      const thread = await prisma.thread.create({
        data: {
          name: 'Test Thread',
          categoryId: category.id,
          authorId: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const postContent = 'This is a test post';
      const result = await caller.post.createPost({
        content: postContent,
        threadId: thread.id,
      });

      expect(result).toBeDefined();
      expect(result.content).toBe(postContent);
      expect(result.threadId).toBe(thread.id);
      expect(result.authorId).toBe(user.id);

      // Verify the post was actually created in the database
      const posts = await prisma.post.findMany({
        where: { threadId: thread.id },
      });
      expect(posts).toHaveLength(1);
      expect(posts[0]?.content).toBe(postContent);
    });

    it('should reject empty content', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id-2',
          name: 'Test User',
          email: 'test2@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Test Thread',
          categoryId: category.id,
          authorId: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.post.createPost({
          content: '',
          threadId: thread.id,
        })
      ).rejects.toThrow();
    });

    it('should create only one post per mutation call', async () => {
      // Regression test for duplicate post creation bug
      // This verifies that calling createPost once results in exactly one post
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id-3',
          name: 'Test User',
          email: 'test3@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Test Thread',
          categoryId: category.id,
          authorId: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      // Count posts before
      const postsBefore = await prisma.post.count({
        where: { threadId: thread.id },
      });
      expect(postsBefore).toBe(0);

      // Create a post
      await caller.post.createPost({
        content: 'Single post content',
        threadId: thread.id,
      });

      // Count posts after - should be exactly 1
      const postsAfter = await prisma.post.count({
        where: { threadId: thread.id },
      });
      expect(postsAfter).toBe(1);
    });
  });

  describe('getPostsByThreadId', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.post.getPostsByThreadId({ threadId: 1 })
      ).rejects.toThrow(TRPCError);
    });

    it('should return posts for a thread', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id-4',
          name: 'Test User',
          email: 'test4@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Test Thread',
          categoryId: category.id,
          authorId: user.id,
        },
      });

      // Create multiple posts
      await prisma.post.createMany({
        data: [
          {
            content: 'Post 1',
            threadId: thread.id,
            authorId: user.id,
          },
          {
            content: 'Post 2',
            threadId: thread.id,
            authorId: user.id,
          },
        ],
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.post.getPostsByThreadId({
        threadId: thread.id,
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.content).toBe('Post 1');
      expect(result[1]?.content).toBe('Post 2');
    });
  });
});
