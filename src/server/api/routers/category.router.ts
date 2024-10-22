import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const categoryRouter = createTRPCRouter({
  getRootCategory: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findFirstOrThrow({
      include: {
        childCategories: true,
      },
    });
  }),

  getCategoryById: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.category.findFirstOrThrow({
        where: {
          id: input.categoryId,
        },
        include: {
          childCategories: true,
        },
      });
    }),

  getChildCategories: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.category.findMany({
        where: {
          parentCategoryId: input.categoryId,
        },
      });
    }),

  getAllCategories: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      include: {
        childCategories: true,
      },
    });
  }),

  createCategory: protectedProcedure
    .input(z.object({ name: z.string(), parentCategoryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const newCategory = await ctx.prisma.category.create({
        data: {
          name: input.name,
          parentCategoryId: input.parentCategoryId,
          createdById: ctx.session?.user.id?.toString(),
        },
      });
      return newCategory;
    }),
});
