import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

function extractSnippet(content: string, query: string): string {
  const MAX = 100;
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1)
    return content.slice(0, MAX) + (content.length > MAX ? '...' : '');
  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + query.length + 60);
  return (
    (start > 0 ? '...' : '') +
    content.slice(start, end) +
    (end < content.length ? '...' : '')
  );
}

export const searchRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const q = input.query.trim();
      if (!q) return [];

      const [
        allCategories,
        matchingCategories,
        matchingThreads,
        matchingPosts,
      ] = await Promise.all([
        ctx.prisma.category.findMany({
          select: {
            id: true,
            name: true,
            parentCategoryId: true,
            isArchive: true,
          },
        }),
        ctx.prisma.category.findMany({
          where: {
            name: { contains: q, mode: 'insensitive' },
            parentCategoryId: { not: null },
          },
          select: { id: true, name: true, parentCategoryId: true },
          take: 5,
          orderBy: { name: 'asc' },
        }),
        ctx.prisma.thread.findMany({
          where: { name: { contains: q, mode: 'insensitive' } },
          select: { id: true, name: true, categoryId: true },
          take: 5,
          orderBy: { name: 'asc' },
        }),
        ctx.prisma.post.findMany({
          where: { content: { contains: q, mode: 'insensitive' } },
          select: {
            id: true,
            content: true,
            thread: { select: { id: true, name: true, categoryId: true } },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const catMap = new Map(allCategories.map((c) => [c.id, c]));

      // Walk up the parent chain, stopping at root (parentCategoryId === null).
      function buildSegments(categoryId: number): string[] {
        const segments: string[] = [];
        let current = catMap.get(categoryId);
        while (current && current.parentCategoryId !== null) {
          segments.unshift(current.name);
          current = catMap.get(current.parentCategoryId);
        }
        return segments;
      }

      // True if the category itself or any ancestor is marked isArchive.
      function isInArchive(categoryId: number): boolean {
        let current = catMap.get(categoryId);
        while (current) {
          if (current.isArchive) return true;
          if (current.parentCategoryId === null) break;
          current = catMap.get(current.parentCategoryId);
        }
        return false;
      }

      const categoryResults = matchingCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: 'category' as const,
        path: `/forum/${buildSegments(cat.id).map(encodeURIComponent).join('/')}`,
        snippet: null,
        isArchive: isInArchive(cat.id),
      }));

      const threadResultIds = new Set(matchingThreads.map((t) => t.id));

      const threadResults = matchingThreads.map((thread) => {
        const segments = buildSegments(thread.categoryId);
        return {
          id: thread.id,
          name: thread.name,
          type: 'thread' as const,
          path: `/forum/${[...segments, thread.name].map(encodeURIComponent).join('/')}`,
          snippet: null,
          isArchive: isInArchive(thread.categoryId),
        };
      });

      // Deduplicate: skip posts whose thread already appears as a name match
      const postResults = matchingPosts
        .filter((post) => !threadResultIds.has(post.thread.id))
        .map((post) => {
          const segments = buildSegments(post.thread.categoryId);
          return {
            id: post.id,
            name: post.thread.name,
            type: 'post' as const,
            path: `/forum/${[...segments, post.thread.name].map(encodeURIComponent).join('/')}`,
            snippet: extractSnippet(post.content, q),
            isArchive: isInArchive(post.thread.categoryId),
          };
        });

      return [...categoryResults, ...threadResults, ...postResults];
    }),
});
