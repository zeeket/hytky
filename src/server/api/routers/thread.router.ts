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
});
