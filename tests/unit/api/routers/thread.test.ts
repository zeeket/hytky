import { TRPCError } from '@trpc/server';
import { createTestCaller, createMockSession } from '../../helpers/trpc';

/**
 * Thread Router Unit Tests
 *
 * These tests use jest-prisma environment which automatically wraps each test
 * in a database transaction that gets rolled back after the test completes.
 * This ensures test isolation without manual cleanup.
 */
describe('threadRouter', () => {
  // Access the Prisma client with automatic transaction rollback
  const prisma = jestPrisma.client;

  describe('deleteThread', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(caller.thread.deleteThread({ threadId: 1 })).rejects.toThrow(
        TRPCError
      );
    });

    it('should delete thread when user is author', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-delete-1',
          name: 'Test User',
          email: 'delete1@example.com',
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
          name: 'Thread to Delete',
          categoryId: category.id,
          authorId: user.id,
        },
      });

      // Create some posts in the thread
      await prisma.post.createMany({
        data: [
          { content: 'Post 1', threadId: thread.id, authorId: user.id },
          { content: 'Post 2', threadId: thread.id, authorId: user.id },
        ],
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.thread.deleteThread({ threadId: thread.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(thread.id);

      // Verify thread was deleted
      const deletedThread = await prisma.thread.findUnique({
        where: { id: thread.id },
      });
      expect(deletedThread).toBeNull();

      // Verify posts were also deleted
      const posts = await prisma.post.findMany({
        where: { threadId: thread.id },
      });
      expect(posts).toHaveLength(0);
    });

    it("should throw error when trying to delete another user's thread", async () => {
      const author = await prisma.user.create({
        data: {
          id: 'test-author-1',
          name: 'Author',
          email: 'author@example.com',
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          id: 'test-other-user-1',
          name: 'Other User',
          email: 'other@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: author.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Thread by Author',
          categoryId: category.id,
          authorId: author.id,
        },
      });

      const session = createMockSession({ user: { id: otherUser.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.thread.deleteThread({ threadId: thread.id })
      ).rejects.toThrow('You can only delete your own threads');

      // Verify thread still exists
      const existingThread = await prisma.thread.findUnique({
        where: { id: thread.id },
      });
      expect(existingThread).not.toBeNull();
    });

    it('should throw error when thread does not exist', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-delete-2',
          name: 'Test User',
          email: 'delete2@example.com',
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.thread.deleteThread({ threadId: 99999 })
      ).rejects.toThrow('Thread not found');
    });
  });

  describe('createThread', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.thread.createThread({
          name: 'Test Thread',
          categoryId: 1,
          firstPostContent: 'Test content',
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should create thread with first post when authenticated', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-create-1',
          name: 'Test User',
          email: 'create1@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.thread.createThread({
        name: 'New Thread',
        categoryId: category.id,
        firstPostContent: 'First post content',
      });

      // Result is the first post
      expect(result).toBeDefined();
      expect(result.content).toBe('First post content');
      expect(result.authorId).toBe(user.id);

      // Verify thread was created
      const threads = await prisma.thread.findMany({
        where: { categoryId: category.id },
      });
      expect(threads).toHaveLength(1);
      expect(threads[0]?.name).toBe('New Thread');
      expect(threads[0]?.authorId).toBe(user.id);
    });
  });

  describe('getThreadById', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.thread.getThreadById({ threadId: 1 })
      ).rejects.toThrow(TRPCError);
    });

    it('should return thread when authenticated', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-get-1',
          name: 'Test User',
          email: 'get1@example.com',
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

      const result = await caller.thread.getThreadById({ threadId: thread.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(thread.id);
      expect(result.name).toBe('Test Thread');
    });
  });

  describe('getThreadsByCategoryId', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.thread.getThreadsByCategoryId({ categoryId: 1 })
      ).rejects.toThrow(TRPCError);
    });

    it('should return threads for a category', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-list-1',
          name: 'Test User',
          email: 'list1@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      await prisma.thread.createMany({
        data: [
          { name: 'Thread 1', categoryId: category.id, authorId: user.id },
          { name: 'Thread 2', categoryId: category.id, authorId: user.id },
        ],
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.thread.getThreadsByCategoryId({
        categoryId: category.id,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('moveThread', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.thread.moveThread({ threadId: 1, targetCategoryId: 2 })
      ).rejects.toThrow(TRPCError);
    });

    it('should move thread to new category when user is author', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-move-1',
          name: 'Test User',
          email: 'move1@example.com',
        },
      });

      const sourceCategory = await prisma.category.create({
        data: {
          name: 'Source Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const targetCategory = await prisma.category.create({
        data: {
          name: 'Target Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Thread to Move',
          categoryId: sourceCategory.id,
          authorId: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.thread.moveThread({
        threadId: thread.id,
        targetCategoryId: targetCategory.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(thread.id);
      expect(result.categoryId).toBe(targetCategory.id);

      // Verify thread was moved in database
      const movedThread = await prisma.thread.findUnique({
        where: { id: thread.id },
      });
      expect(movedThread?.categoryId).toBe(targetCategory.id);
    });

    it("should throw error when trying to move another user's thread", async () => {
      const author = await prisma.user.create({
        data: {
          id: 'test-author-move-1',
          name: 'Author',
          email: 'author-move@example.com',
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          id: 'test-other-move-1',
          name: 'Other User',
          email: 'other-move@example.com',
        },
      });

      const sourceCategory = await prisma.category.create({
        data: {
          name: 'Source Category',
          parentCategoryId: null,
          createdById: author.id,
        },
      });

      const targetCategory = await prisma.category.create({
        data: {
          name: 'Target Category',
          parentCategoryId: null,
          createdById: author.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Thread by Author',
          categoryId: sourceCategory.id,
          authorId: author.id,
        },
      });

      const session = createMockSession({ user: { id: otherUser.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.thread.moveThread({
          threadId: thread.id,
          targetCategoryId: targetCategory.id,
        })
      ).rejects.toThrow('You can only move your own threads');

      // Verify thread was not moved
      const existingThread = await prisma.thread.findUnique({
        where: { id: thread.id },
      });
      expect(existingThread?.categoryId).toBe(sourceCategory.id);
    });

    it('should throw error when thread does not exist', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-move-2',
          name: 'Test User',
          email: 'move2@example.com',
        },
      });

      const targetCategory = await prisma.category.create({
        data: {
          name: 'Target Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.thread.moveThread({
          threadId: 99999,
          targetCategoryId: targetCategory.id,
        })
      ).rejects.toThrow('Thread not found');
    });

    it('should throw error when target category does not exist', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'test-user-move-3',
          name: 'Test User',
          email: 'move3@example.com',
        },
      });

      const sourceCategory = await prisma.category.create({
        data: {
          name: 'Source Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const thread = await prisma.thread.create({
        data: {
          name: 'Thread to Move',
          categoryId: sourceCategory.id,
          authorId: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      await expect(
        caller.thread.moveThread({
          threadId: thread.id,
          targetCategoryId: 99999,
        })
      ).rejects.toThrow('Target category not found');
    });
  });
});
