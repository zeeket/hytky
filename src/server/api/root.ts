import { createTRPCRouter } from "~/server/api/trpc";
import { indexRouter } from "~/server/api/routers/index";
import { categoryRouter } from "~/server/api/routers/category.router";
import { threadRouter } from "~/server/api/routers/thread.router";
import { postRouter } from "~/server/api/routers/post.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  index: indexRouter,
  category: categoryRouter,
  thread: threadRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
