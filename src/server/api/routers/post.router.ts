import { z } from "zod";

import {
  createTRPCRouter,
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
    .mutation(async ({ input, ctx }) => {
    const newPost = await ctx.prisma.post.create({
      data: {
        content: input.content,
        authorId: ctx.session?.user.id?.toString(),
        threadId: input.threadId,
      },
    });
    return newPost;
  }),

});
