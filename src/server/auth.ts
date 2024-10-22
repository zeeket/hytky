import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  objectToAuthDataMap,
  AuthDataValidator,
  type TelegramUserData,
} from '@telegram-auth/server';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { env } from '~/env.mjs';
import { prisma } from '~/server/db';
import logger from '../utils/logger';
import { type UserRole } from './api/types';
import { checkUserRole } from '../utils/checkUserRole';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth/jwt' {
  interface JWT {
    userId: number;
    role: UserRole;
  }
}

declare module 'next-auth' {
  interface User {
    id: number;
    name: string;
    image: string;
    role: UserRole;
  }
  interface Session extends DefaultSession {
    user: User;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      //console.log(`user.id: ${user?.id}`);
      if (user) {
        //console.log(`user keys: ${Object.keys(user)}`)
        token.userId = user.id as number;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: `${env.TG_BOT_TOKEN}`,
        });
        const data = objectToAuthDataMap(req.query || {});
        const user: TelegramUserData = await validator.validate(data);
        if (user.id && user.first_name) {
          const role: UserRole = await checkUserRole(user.id);
          logger.info(`role: ${role}`);
          logger.info(`userId: ${user.id.toString()}`);
          if (role === 'nakki') {
            logger.info('user is nakki, not allowed to login');
            return null;
          }
          await prisma.user.upsert({
            where: { id: user.id.toString() },
            update: {
              name: [user.first_name, user.last_name || ''].join(' '),
            },
            create: {
              id: user.id.toString(),
              name: [user.first_name, user.last_name || ''].join(' '),
            },
          });
          return {
            id: user.id,
            name: [user.first_name, user.last_name || ''].join(' '),
            image: user.photo_url || '',
            role: role,
          };
        }
        //return null if Telegram login validation fails
        return null;
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
