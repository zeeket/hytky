import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const threadRouter = createTRPCRouter({
  getThreadById: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.thread.findFirstOrThrow({
        where: {
          id: input.threadId,
        },
      });
    }),

  getAllThreads: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({});
  }),

  getThreadsByCategoryId: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.thread.findMany({
        where: {
          categoryId: input.categoryId,
        },
      });
    }),

  createThread: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        categoryId: z.number(),
        firstPostContent: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.thread
        .create({
          data: {
            name: input.name,
            authorId: ctx.session.user.id,
            categoryId: input.categoryId,
          },
        })
        .then((thread: { id: number }) => {
          return ctx.prisma.post.create({
            data: {
              content: input.firstPostContent,
              authorId: ctx.session.user.id,
              threadId: thread.id,
            },
          });
        });
    }),

  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const thread = await ctx.prisma.thread.findUnique({
        where: { id: input.threadId },
      });

      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.authorId !== ctx.session.user.id) {
        throw new Error('You can only delete your own threads');
      }

      await ctx.prisma.post.deleteMany({
        where: { threadId: input.threadId },
      });

      return ctx.prisma.thread.delete({
        where: { id: input.threadId },
      });
    }),

  moveThread: protectedProcedure
    .input(z.object({ threadId: z.number(), targetCategoryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const thread = await ctx.prisma.thread.findUnique({
        where: { id: input.threadId },
      });

      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.authorId !== ctx.session.user.id) {
        throw new Error('You can only move your own threads');
      }

      // Verify target category exists
      const targetCategory = await ctx.prisma.category.findUnique({
        where: { id: input.targetCategoryId },
      });

      if (!targetCategory) {
        throw new Error('Target category not found');
      }

      return ctx.prisma.thread.update({
        where: { id: input.threadId },
        data: { categoryId: input.targetCategoryId },
      });
    }),
});
