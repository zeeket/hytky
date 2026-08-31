import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from 'next-auth';
import { type OAuthConfig } from 'next-auth/providers/oauth';
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
    userId: string;
    role: UserRole;
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    image: string;
    role: UserRole;
  }
  interface Session extends DefaultSession {
    user: User;
  }
  interface NextAuthOptions {
    /** Allow auth callbacks to trust reverse proxies inside Docker */
    trustHost?: boolean;
  }
}

/** Telegram's OpenID Connect issuer. */
const TELEGRAM_ISSUER = 'https://oauth.telegram.org';

/**
 * The claims Telegram puts in the ID token for our `openid profile
 * telegram:bot_access` scope. Telegram has no userinfo endpoint — the ID
 * token is the whole profile.
 *
 * @see https://core.telegram.org/bots/telegram-login
 */
interface TelegramIdTokenClaims {
  /**
   * The OIDC subject identifier — *not* the Telegram user ID. Telegram issues
   * a pairwise `sub`, unique to this OAuth client (19 digits, where real
   * Telegram user IDs are ~10). Unused; see `telegramUserId` below.
   */
  sub: string;
  /**
   * The bot-visible Telegram user ID. Present only because we request the
   * `telegram:bot_access` scope — see `telegramUserId` below.
   */
  id?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
}

/**
 * The Telegram user ID, which HYTKYbot needs to check group membership and
 * which is the forum's `User.id` primary key.
 *
 * This is the `id` claim, *not* `sub`: `sub` is a pairwise identifier scoped
 * to this OAuth client, so HYTKYbot can never match it against a member of
 * the Telegram groups and every login would come back `nakki`. The `id` claim
 * carries the real, bot-visible ID, and Telegram only sends it because the
 * authorization request asks for the `telegram:bot_access` scope.
 *
 * Missing `id` therefore means the scope was refused or dropped. Throwing
 * fails the login loudly, rather than falling back to `sub` and keying a user
 * row — the primary key the whole forum references — to a value that does not
 * identify a Telegram account.
 */
const telegramUserId = (claims: TelegramIdTokenClaims): string => {
  if (!claims.id) {
    throw new Error(
      'Telegram ID token has no `id` claim; the `telegram:bot_access` scope is required to identify the user to HYTKYbot'
    );
  }
  return claims.id;
};

/** Build a display name out of the OIDC name claims. */
const displayName = (claims: TelegramIdTokenClaims): string =>
  [claims.given_name, claims.family_name].filter(Boolean).join(' ') ||
  claims.name ||
  claims.preferred_username ||
  '';

/**
 * Telegram login via Telegram's OpenID Connect provider.
 *
 * The Client ID (the bot's ID) and Client Secret come from @BotFather under
 * Bot Settings > Web Login, where the callback URL below must also be
 * registered: `<NEXTAUTH_URL>/api/auth/callback/telegram`.
 *
 * NextAuth (through `openid-client`) runs the Authorization Code Flow with
 * PKCE and `state`, then verifies the ID token's signature against Telegram's
 * JWKS along with its `iss`, `aud` and `exp` claims — this replaces the
 * bot-token-keyed HMAC validation the old login widget needed.
 *
 * No `wellKnown` here on purpose: `openid-client` v5 asks servers not to
 * compress responses (`Accept-Encoding: identity`) and never falls back to
 * decompressing them if a server ignores that. Telegram's discovery document
 * at `/.well-known/openid-configuration` does exactly that — always
 * gzip-encoded — which breaks `Issuer.discover()` with a JSON parse error.
 * The `authorization`/`token`/`jwks_endpoint` URLs below (copied from that
 * same discovery document) sidestep discovery entirely; those endpoints, by
 * contrast, do honor `Accept-Encoding: identity`.
 */
const telegramProvider: OAuthConfig<TelegramIdTokenClaims> = {
  id: 'telegram',
  name: 'Telegram',
  type: 'oauth',
  issuer: TELEGRAM_ISSUER,
  jwks_endpoint: `${TELEGRAM_ISSUER}/.well-known/jwks.json`,
  token: `${TELEGRAM_ISSUER}/token`,
  clientId: env.TG_OAUTH_CLIENT_ID,
  clientSecret: env.TG_OAUTH_CLIENT_SECRET,
  authorization: {
    url: `${TELEGRAM_ISSUER}/auth`,
    // `openid` is required, `profile` adds the name and avatar claims, and
    // `telegram:bot_access` links the token to our bot — without it the `sub`
    // is a pairwise identifier HYTKYbot cannot resolve to a group member.
    params: { scope: 'openid profile telegram:bot_access' },
  },
  checks: ['pkce', 'state'],
  // Read the profile from the ID token; Telegram has no userinfo endpoint.
  idToken: true,
  client: {
    // Telegram authenticates the token request with HTTP Basic.
    token_endpoint_auth_method: 'client_secret_basic',
    // RS256 is Telegram's default. Change this if the bot is configured for
    // another algorithm under Login Widget > Advanced in @BotFather.
    id_token_signed_response_alg: 'RS256',
  },
  /**
   * Runs after the ID token has been verified. Mirrors the old provider's
   * `authorize`: ask HYTKYbot for the user's group membership role, then keep
   * the user row in sync. `nakki` users are turned away by the `signIn`
   * callback below, so no row is created for them.
   */
  async profile(claims) {
    const telegramId = telegramUserId(claims);
    const name = displayName(claims);
    const image = claims.picture ?? '';

    const role: UserRole = await checkUserRole(telegramId);
    logger.info(`role: ${role}`);
    logger.info(`userId: ${telegramId}`);

    if (role === 'nakki') {
      logger.info('user is nakki, not allowed to login');
      return { id: telegramId, name, image, role };
    }

    const dbUser = await prisma.user.upsert({
      where: { id: telegramId },
      update: { name },
      create: { id: telegramId, name },
    });

    return {
      // The database user's ID — the Telegram ID stored as a string.
      id: dbUser.id,
      name,
      image,
      role,
    };
  },
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Trust the proxy in Docker/reverse proxy environments
  trustHost: true,
  callbacks: {
    // Members of the `nakki` group are not allowed into the forum. Returning
    // false sends them to the sign-in page with `?error=AccessDenied`.
    signIn: ({ user }) => user.role !== 'nakki',
    redirect: async ({ url, baseUrl }) => {
      // Handle relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Handle same origin URLs
      // Compare origins, not full URLs, since baseUrl may include a path
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      // Default to base URL
      return baseUrl;
    },
    jwt: ({ token, user }) => {
      //console.log(`user.id: ${user?.id}`);
      if (user) {
        //console.log(`user keys: ${Object.keys(user)}`)
        token.userId = user.id;
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
    // Show login failures (e.g. `AccessDenied`) on our own sign-in page
    // instead of NextAuth's default error page.
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // No adapter on purpose: `User.id` is the Telegram user ID, which the forum
  // rows reference, so the provider's `profile()` upserts the user itself
  // rather than letting an adapter mint its own IDs.
  providers: [telegramProvider],
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
