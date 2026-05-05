import { TRPCError } from '@trpc/server';
import {
  createTestCaller,
  createMockSession,
} from '../../../unit/helpers/trpc';

/**
 * Search Router Unit Tests
 *
 * Tests use jest-prisma which wraps each test in a rolled-back transaction,
 * giving full isolation without manual cleanup.
 */
describe('searchRouter', () => {
  const prisma = jestPrisma.client;

  // Shared seed helpers
  async function seedUser(suffix: string) {
    return prisma.user.create({
      data: {
        id: `search-user-${suffix}`,
        name: `User ${suffix}`,
        email: `search-${suffix}@example.com`,
      },
    });
  }

  async function seedCategory(
    name: string,
    parentId: number | null,
    userId: string,
    isArchive = false
  ) {
    return prisma.category.create({
      data: {
        name,
        parentCategoryId: parentId,
        createdById: userId,
        isArchive,
      },
    });
  }

  async function seedThread(name: string, categoryId: number, userId: string) {
    return prisma.thread.create({
      data: { name, categoryId, authorId: userId },
    });
  }

  async function seedPost(content: string, threadId: number, userId: string) {
    return prisma.post.create({
      data: { content, threadId, authorId: userId },
    });
  }

  describe('search', () => {
    it('throws UNAUTHORIZED without session', async () => {
      const caller = createTestCaller(null);
      await expect(caller.search.search({ query: 'test' })).rejects.toThrow(
        TRPCError
      );
    });

    it('returns empty array when nothing matches', async () => {
      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'zzz-no-match-xqz' });

      expect(results).toEqual([]);
    });

    it('returns empty array when query trims to empty string', async () => {
      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: '   ' });

      expect(results).toEqual([]);
    });

    it('finds a matching category', async () => {
      const user = await seedUser('cat-basic');
      const root = await seedCategory('Root', null, user.id);
      await seedCategory('Elektromusiikki', root.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'elektro' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        name: 'Elektromusiikki',
        type: 'category',
        path: '/forum/Elektromusiikki',
      });
    });

    it('finds a matching thread', async () => {
      const user = await seedUser('thread-basic');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Tapahtumat', root.id, user.id);
      await seedThread('Kesäbileet 2026', cat.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'bileet' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        name: 'Kesäbileet 2026',
        type: 'thread',
        path: '/forum/Tapahtumat/Kes%C3%A4bileet%202026',
      });
    });

    it('is case-insensitive', async () => {
      const user = await seedUser('case');
      const root = await seedCategory('Root', null, user.id);
      await seedCategory('Musiikki', root.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const upper = await caller.search.search({ query: 'MUSIIKKI' });
      const lower = await caller.search.search({ query: 'musiikki' });
      const mixed = await caller.search.search({ query: 'MuSiIkKi' });

      expect(upper).toHaveLength(1);
      expect(lower).toHaveLength(1);
      expect(mixed).toHaveLength(1);
    });

    it('returns both categories and threads when both match', async () => {
      const user = await seedUser('both');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Hytky Events', root.id, user.id);
      await seedThread('Hytky Summer', cat.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'hytky' });

      expect(results.some((r) => r.type === 'category')).toBe(true);
      expect(results.some((r) => r.type === 'thread')).toBe(true);
    });

    it('excludes the root category (parentCategoryId = null) from results', async () => {
      const user = await seedUser('root-excl');
      await seedCategory('SearchableRoot', null, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'SearchableRoot' });

      expect(results).toEqual([]);
    });

    it('includes archive categories in results and sets isArchive flag', async () => {
      const user = await seedUser('archive');
      const root = await seedCategory('Root', null, user.id);
      await seedCategory('Old Stuff', root.id, user.id, true);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Old Stuff' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({ name: 'Old Stuff', isArchive: true });
    });

    it('includes threads in archive categories and sets isArchive flag', async () => {
      const user = await seedUser('arc-thread');
      const root = await seedCategory('Root', null, user.id);
      const archiveCat = await seedCategory(
        'Archive Cat',
        root.id,
        user.id,
        true
      );
      await seedThread('Old Thread', archiveCat.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Old Thread' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({ name: 'Old Thread', isArchive: true });
    });

    it('builds a nested category path correctly', async () => {
      const user = await seedUser('nested');
      const root = await seedCategory('Root', null, user.id);
      const lvl1 = await seedCategory('Level1', root.id, user.id);
      const lvl2 = await seedCategory('Level2', lvl1.id, user.id);
      await seedCategory('Level3', lvl2.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Level3' });

      expect(results).toHaveLength(1);
      expect(results[0]?.path).toBe('/forum/Level1/Level2/Level3');
    });

    it('builds a thread path using the full category hierarchy', async () => {
      const user = await seedUser('nested-thread');
      const root = await seedCategory('Root', null, user.id);
      const lvl1 = await seedCategory('Cat A', root.id, user.id);
      const lvl2 = await seedCategory('Cat B', lvl1.id, user.id);
      await seedThread('Deep Thread', lvl2.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Deep Thread' });

      expect(results).toHaveLength(1);
      expect(results[0]?.path).toBe('/forum/Cat%20A/Cat%20B/Deep%20Thread');
    });

    it('URL-encodes special characters in paths', async () => {
      const user = await seedUser('special');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Ääni & Musiikki', root.id, user.id);
      await seedThread('Pöytä/Tuoli', cat.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const catResults = await caller.search.search({ query: 'Ääni' });
      expect(catResults[0]?.path).toBe(
        '/forum/%C3%84%C3%A4ni%20%26%20Musiikki'
      );

      const threadResults = await caller.search.search({ query: 'Pöytä' });
      expect(threadResults[0]?.path).toContain('%2F'); // forward slash encoded
    });

    it('caps results at 5 categories and 5 threads', async () => {
      const user = await seedUser('cap');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Container', root.id, user.id);

      for (let i = 0; i < 7; i++) {
        await seedCategory(`Cap Cat ${i}`, root.id, user.id);
        await seedThread(`Cap Thread ${i}`, cat.id, user.id);
      }

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Cap' });

      const cats = results.filter((r) => r.type === 'category');
      const threads = results.filter((r) => r.type === 'thread');
      expect(cats.length).toBeLessThanOrEqual(5);
      expect(threads.length).toBeLessThanOrEqual(5);
    });

    it('finds a post by content and returns its thread as the navigation target', async () => {
      const user = await seedUser('post-basic');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Musiikki', root.id, user.id);
      const thread = await seedThread('Suosituksia', cat.id, user.id);
      await seedPost('Kuunnelkaa ehdottomasti Autechrea', thread.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Autechre' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        name: 'Suosituksia',
        type: 'post',
        path: '/forum/Musiikki/Suosituksia',
      });
    });

    it('includes a snippet of matched post content', async () => {
      const user = await seedUser('post-snippet');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Yleinen', root.id, user.id);
      const thread = await seedThread('Ajatuksia', cat.id, user.id);
      await seedPost(
        'Tämä on pitkä viesti jossa puhutaan elektronisesta musiikista ja sen historiasta',
        thread.id,
        user.id
      );

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'elektronisesta' });

      expect(results[0]?.snippet).toBeTruthy();
      expect(results[0]?.snippet).toContain('elektronisesta');
    });

    it('includes posts from archive categories and sets isArchive flag', async () => {
      const user = await seedUser('post-archive');
      const root = await seedCategory('Root', null, user.id);
      const archiveCat = await seedCategory('Arkisto', root.id, user.id, true);
      const thread = await seedThread('Vanha lanka', archiveCat.id, user.id);
      await seedPost('Uniikki sisältö arkistossa', thread.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Uniikki sisältö' });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        name: 'Vanha lanka',
        isArchive: true,
      });
    });

    it('deduplicates: skips post result when its thread already matches by name', async () => {
      const user = await seedUser('post-dedup');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Kategoria', root.id, user.id);
      const thread = await seedThread('Autechre levy', cat.id, user.id);
      // Post content also contains the same search term as the thread name
      await seedPost('Autechre on loistava yhtye', thread.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'Autechre' });

      const threadHits = results.filter((r) => r.type === 'thread');
      const postHits = results.filter((r) => r.type === 'post');
      // Thread appears once by name; post for the same thread is suppressed
      expect(threadHits).toHaveLength(1);
      expect(postHits).toHaveLength(0);
    });

    it('caps post results at 5', async () => {
      const user = await seedUser('post-cap');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Säsäilö', root.id, user.id);

      for (let i = 0; i < 7; i++) {
        const thread = await seedThread(`Säie ${i}`, cat.id, user.id);
        await seedPost(`Hakutulos viestissä numero ${i}`, thread.id, user.id);
      }

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({
        query: 'Hakutulos viestissä',
      });

      const posts = results.filter((r) => r.type === 'post');
      expect(posts.length).toBeLessThanOrEqual(5);
    });

    it('post result path encodes the thread name correctly', async () => {
      const user = await seedUser('post-path');
      const root = await seedCategory('Root', null, user.id);
      const cat = await seedCategory('Äänet', root.id, user.id);
      const thread = await seedThread('Ääni & Tila', cat.id, user.id);
      await seedPost('Tässä viestissä on erikoismerkkejä', thread.id, user.id);

      const session = createMockSession();
      const caller = createTestCaller(session);

      const results = await caller.search.search({ query: 'erikoismerkkejä' });

      expect(results[0]?.path).toBe(
        '/forum/%C3%84%C3%A4net/%C3%84%C3%A4ni%20%26%20Tila'
      );
    });
  });
});
