import { TRPCError } from '@trpc/server';
import {
  createTestCaller,
  createMockSession,
} from '../../../unit/helpers/trpc';

/**
 * Category Router Unit Tests
 *
 * These tests use jest-prisma environment which automatically wraps each test
 * in a database transaction that gets rolled back after the test completes.
 * This ensures test isolation without manual cleanup.
 */
describe('categoryRouter', () => {
  // Access the Prisma client with automatic transaction rollback
  const prisma = jestPrisma.client;

  describe('getRootCategory', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(caller.category.getRootCategory()).rejects.toThrow(
        TRPCError
      );
    });

    it('should get root category when authenticated', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id1',
          name: 'Test User',
          email: 'test1@example.com',
        },
      });

      // Seed test data
      await prisma.category.create({
        data: {
          name: 'Root Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getRootCategory();

      // getRootCategory returns the FIRST category from the database
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.childCategories).toBeDefined();
    });

    it('should include child categories in result', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id2',
          name: 'Test User',
          email: 'test2@example.com',
        },
      });

      // Seed test data with parent and child categories
      const parent = await prisma.category.create({
        data: {
          name: 'Parent Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      await prisma.category.create({
        data: {
          name: 'Child Category',
          parentCategoryId: parent.id,
          createdById: user.id,
        },
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getRootCategory();

      // Verify the response structure includes childCategories array
      expect(result).toBeDefined();
      expect(Array.isArray(result.childCategories)).toBe(true);
    });
  });

  describe('getCategoryById', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.category.getCategoryById({ categoryId: 1 })
      ).rejects.toThrow(TRPCError);
    });

    it('should get category by id when authenticated', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id3',
          name: 'Test User',
          email: 'test3@example.com',
        },
      });

      // Seed test data
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getCategoryById({
        categoryId: category.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(category.id);
      expect(result.name).toBe('Test Category');
    });

    it('should throw error when category does not exist', async () => {
      const session = createMockSession();
      const caller = createTestCaller(session);

      await expect(
        caller.category.getCategoryById({ categoryId: 99999 })
      ).rejects.toThrow();
    });
  });

  describe('getChildCategories', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.category.getChildCategories({ categoryId: 1 })
      ).rejects.toThrow(TRPCError);
    });

    it('should get child categories of a parent', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id4',
          name: 'Test User',
          email: 'test4@example.com',
        },
      });

      // Seed test data
      const parent = await prisma.category.create({
        data: {
          name: 'Parent',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      await prisma.category.createMany({
        data: [
          {
            name: 'Child A',
            parentCategoryId: parent.id,
            createdById: user.id,
          },
          {
            name: 'Child B',
            parentCategoryId: parent.id,
            createdById: user.id,
          },
          {
            name: 'Child C',
            parentCategoryId: parent.id,
            createdById: user.id,
          },
        ],
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getChildCategories({
        categoryId: parent.id,
      });

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toEqual(
        expect.arrayContaining(['Child A', 'Child B', 'Child C'])
      );
    });

    it('should return empty array when category has no children', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id5',
          name: 'Test User',
          email: 'test5@example.com',
        },
      });

      const category = await prisma.category.create({
        data: {
          name: 'Childless Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getChildCategories({
        categoryId: category.id,
      });

      expect(result).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(caller.category.getAllCategories()).rejects.toThrow(
        TRPCError
      );
    });

    it('should get all categories when authenticated', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'test-user-id6',
          name: 'Test User',
          email: 'test6@example.com',
        },
      });

      // Seed test data with multiple categories
      await prisma.category.createMany({
        data: [
          {
            name: 'Category 1',
            parentCategoryId: null,
            createdById: user.id,
          },
          {
            name: 'Category 2',
            parentCategoryId: null,
            createdById: user.id,
          },
        ],
      });

      const session = createMockSession();
      const caller = createTestCaller(session);

      const result = await caller.category.getAllCategories();

      // Verify the response is an array of categories
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('childCategories');
    });
  });

  describe('createCategory', () => {
    it('should throw UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);

      await expect(
        caller.category.createCategory({
          name: 'New Category',
          parentCategoryId: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should create a new category when authenticated', async () => {
      // Create test users
      const user = await prisma.user.create({
        data: {
          id: 'user-123',
          name: 'Test User',
          email: 'user123@example.com',
        },
      });

      // Seed parent category
      const parent = await prisma.category.create({
        data: {
          name: 'Parent Category',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession({ user: { id: user.id } });
      const caller = createTestCaller(session);

      const result = await caller.category.createCategory({
        name: 'New Child Category',
        parentCategoryId: parent.id,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('New Child Category');
      expect(result.parentCategoryId).toBe(parent.id);
      expect(result.createdById).toBe('user-123');

      // Verify it was actually created in the database
      const dbCategory = await prisma.category.findUnique({
        where: { id: result.id },
      });

      expect(dbCategory).toBeDefined();
      expect(dbCategory?.name).toBe('New Child Category');
    });

    it('should create category with session user id', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          id: 'telegram-12345',
          name: 'Telegram User',
          email: 'telegram@example.com',
        },
      });

      const parent = await prisma.category.create({
        data: {
          name: 'Parent',
          parentCategoryId: null,
          createdById: user.id,
        },
      });

      const session = createMockSession({
        user: { id: user.id },
      });
      const caller = createTestCaller(session);

      const result = await caller.category.createCategory({
        name: 'Test Category',
        parentCategoryId: parent.id,
      });

      expect(result.createdById).toBe('telegram-12345');
    });
  });
});
