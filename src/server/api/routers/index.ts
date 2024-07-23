import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const indexRouter = createTRPCRouter({
  hello: publicProcedure
    .query(() => {
      return {
        greeting: `DIY techno culture since 1996.`,
      };
    }),

  getSecretMessage: protectedProcedure.query(({ctx}) => {
    return `(nro ${ctx.session?.user.id}) Sinulla on pääsy foorumille osoitteessa ${env.NEXTAUTH_URL}/forum`;
  }),
});
