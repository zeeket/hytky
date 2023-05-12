import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .query(() => {
      return {
        greeting: `Beta versio. Ilmoita bugit ja ideat nettisivu-vastaavalle`,
      };
    }),

/*   getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }), */

  getSecretMessage: protectedProcedure.query(({ctx}) => {
    return `(nro ${ctx.session?.user.id}) Sinulla on pääsy foorumille osoitteessa ${env.NEXTAUTH_URL}/forum`;
  }),
});
