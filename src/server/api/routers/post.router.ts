import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({

  getPostById: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.thread.findFirstOrThrow({
          where: {
            id: input.postId,
          },
        });
      }),

  getAllThreads: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({});
  }),

  getPostsByThreadId: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.post.findMany({
        where: {
          threadId: input.threadId,
        },
      })
    }),

  createPost: protectedProcedure
    .input(z.object({ content: z.string(), threadId: z.number() }))
    .mutation(({ input, ctx }) => {
    return ctx.prisma.thread.create({
      data: {
        authorId: ctx.session.user.id,
        threadId: input.threadId,
        content: input.content,
      },
    });
  }),
});
