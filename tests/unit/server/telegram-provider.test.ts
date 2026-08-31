import type { OAuthConfig } from 'next-auth/providers/oauth';
import type { User } from 'next-auth';
import { authOptions } from '~/server/auth';

/**
 * Telegram OpenID Connect Provider Tests
 *
 * Login goes through Telegram's OIDC provider: NextAuth verifies the ID token
 * and hands the claims to `profile()`, which asks HYTKYbot for the user's role
 * and keeps the `User` row in sync. These tests cover that mapping and the
 * `nakki` rejection, plus the provider options the flow depends on.
 *
 * `~/server/db` is redirected to the jest-prisma client so the upsert happens
 * inside the per-test transaction and is rolled back afterwards.
 */
jest.mock('~/server/db', () => ({
  get prisma() {
    return jestPrisma.client;
  },
}));

interface TelegramClaims {
  sub: string;
  id?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
}

/**
 * Telegram sends two identifiers, and only one of them identifies the account:
 * `sub` is pairwise (scoped to this OAuth client), while `id` is the real
 * bot-visible Telegram user ID that arrives with the `telegram:bot_access`
 * scope. The two are always different, so tests pass a `sub` that would fail
 * every assertion if the provider ever read it instead of `id`.
 */
const claimsFor = (
  telegramId: string,
  rest: Omit<TelegramClaims, 'sub' | 'id'> = {}
): TelegramClaims => ({
  sub: `55164564976724607${telegramId.slice(-2)}`,
  id: telegramId,
  ...rest,
});

describe('Telegram OIDC provider', () => {
  const provider = authOptions
    .providers[0] as unknown as OAuthConfig<TelegramClaims>;

  /** Stub the HYTKYbot role lookup done by `checkUserRole`. */
  const mockRoleResponse = (role: string) => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ role }),
    }) as unknown as typeof fetch;
    return global.fetch as jest.MockedFunction<typeof fetch>;
  };

  const getProfile = (claims: TelegramClaims) =>
    provider.profile(claims, {} as Parameters<typeof provider.profile>[1]);

  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('provider options', () => {
    it('should be an OIDC provider pointed at Telegram', () => {
      expect(provider.id).toBe('telegram');
      expect(provider.type).toBe('oauth');
      expect(provider.issuer).toBe('https://oauth.telegram.org');
    });

    // No `wellKnown`: Telegram's discovery document always gzips its
    // response regardless of `Accept-Encoding`, which `openid-client` v5
    // can't decompress, so `Issuer.discover()` fails with a JSON parse
    // error. The endpoints below (copied from that same discovery document)
    // sidestep discovery — those endpoints do honor `Accept-Encoding: identity`.
    it('should configure endpoints directly instead of via discovery', () => {
      expect(provider.wellKnown).toBeUndefined();
      expect(provider.jwks_endpoint).toBe(
        'https://oauth.telegram.org/.well-known/jwks.json'
      );
      expect(provider.token).toBe('https://oauth.telegram.org/token');
    });

    it('should read the profile from the ID token', () => {
      // Telegram has no userinfo endpoint.
      expect(provider.idToken).toBe(true);
      expect(provider.userinfo).toBeUndefined();
    });

    it('should use the authorization code flow with PKCE and state', () => {
      expect(provider.checks).toEqual(
        expect.arrayContaining(['pkce', 'state'])
      );
      expect(provider.authorization).toEqual({
        url: 'https://oauth.telegram.org/auth',
        // `telegram:bot_access` is what makes Telegram send the `id` claim,
        // the real user ID HYTKYbot checks group membership with. Without it
        // the token only carries the pairwise `sub` and every login fails.
        params: { scope: 'openid profile telegram:bot_access' },
      });
    });

    it('should authenticate the token request with HTTP Basic', () => {
      expect(provider.client?.token_endpoint_auth_method).toBe(
        'client_secret_basic'
      );
    });
  });

  describe('profile()', () => {
    it('should map the OIDC claims and upsert the user', async () => {
      mockRoleResponse('active');

      const user = (await getProfile(
        claimsFor('123456789', {
          given_name: 'Testi',
          family_name: 'Käyttäjä',
          preferred_username: 'testi',
          picture: 'https://example.com/avatar.jpg',
        })
      )) as User;

      expect(user).toEqual({
        id: '123456789',
        name: 'Testi Käyttäjä',
        image: 'https://example.com/avatar.jpg',
        role: 'active',
      });

      // The Telegram ID is stored verbatim as the primary key, since forum
      // rows reference users by it.
      const dbUser = await jestPrisma.client.user.findUnique({
        where: { id: '123456789' },
      });
      expect(dbUser?.name).toBe('Testi Käyttäjä');
    });

    it('should identify the user by the `id` claim, not the pairwise `sub`', async () => {
      const fetchMock = mockRoleResponse('active');
      const claims = claimsFor('365032236', { given_name: 'Emil' });

      const user = (await getProfile(claims)) as User;

      // `sub` is scoped to this OAuth client, so HYTKYbot cannot match it
      // against a Telegram group member — the role lookup and the `User` row
      // must both use `id`.
      expect(user.id).toBe('365032236');
      expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
        JSON.stringify({ user: '365032236' })
      );
      expect(
        await jestPrisma.client.user.findUnique({ where: { id: claims.sub } })
      ).toBeNull();
    });

    it('should reject a token without the `id` claim', async () => {
      mockRoleResponse('active');

      // Telegram only sends `id` for the `telegram:bot_access` scope. Without
      // it the login has to fail rather than key a user row to `sub`.
      await expect(getProfile({ sub: '5516456497672460715' })).rejects.toThrow(
        'telegram:bot_access'
      );
      expect(global.fetch).not.toHaveBeenCalled();
      expect(
        await jestPrisma.client.user.findUnique({
          where: { id: '5516456497672460715' },
        })
      ).toBeNull();
    });

    it('should handle a user without a last name or avatar', async () => {
      mockRoleResponse('admin');

      const user = (await getProfile(
        claimsFor('223456789', { given_name: 'Testi' })
      )) as User;

      expect(user.name).toBe('Testi');
      expect(user.image).toBe('');
      expect(user.role).toBe('admin');
    });

    it('should handle the empty `family_name` Telegram sends for a one-name account', async () => {
      mockRoleResponse('active');

      const user = (await getProfile(
        claimsFor('623456789', {
          name: 'Emil',
          given_name: 'Emil',
          family_name: '',
          preferred_username: 'zeeket',
        })
      )) as User;

      expect(user.name).toBe('Emil');
    });

    it('should fall back to the username when no name claims are sent', async () => {
      mockRoleResponse('active');

      const user = (await getProfile(
        claimsFor('723456789', { preferred_username: 'zeeket' })
      )) as User;

      expect(user.name).toBe('zeeket');
    });

    it('should update the name of a returning user', async () => {
      await jestPrisma.client.user.create({
        data: { id: '323456789', name: 'Vanha Nimi' },
      });
      mockRoleResponse('active');

      const user = (await getProfile(
        claimsFor('323456789', { given_name: 'Uusi', family_name: 'Nimi' })
      )) as User;

      expect(user.id).toBe('323456789');
      const dbUser = await jestPrisma.client.user.findUnique({
        where: { id: '323456789' },
      });
      expect(dbUser?.name).toBe('Uusi Nimi');
    });

    it('should not create a user row for a nakki member', async () => {
      mockRoleResponse('nakki');

      const user = (await getProfile(
        claimsFor('423456789', { given_name: 'Nakki' })
      )) as User;

      expect(user.role).toBe('nakki');
      const dbUser = await jestPrisma.client.user.findUnique({
        where: { id: '423456789' },
      });
      expect(dbUser).toBeNull();
    });

    it('should propagate a failed role lookup', async () => {
      mockRoleResponse('not-a-role');

      await expect(getProfile(claimsFor('523456789'))).rejects.toThrow(
        'Invalid user role'
      );
    });
  });

  describe('signIn callback', () => {
    const signInCallback = authOptions.callbacks?.signIn;

    if (!signInCallback) {
      throw new Error('signIn callback not found in authOptions');
    }

    const signInWithRole = (role: 'admin' | 'active' | 'nakki') =>
      signInCallback({
        user: { id: '1', name: 'Test', image: '', role },
        account: null,
      });

    it('should let admins and active members in', async () => {
      expect(await signInWithRole('admin')).toBe(true);
      expect(await signInWithRole('active')).toBe(true);
    });

    it('should reject nakki members', async () => {
      expect(await signInWithRole('nakki')).toBe(false);
    });
  });
});
