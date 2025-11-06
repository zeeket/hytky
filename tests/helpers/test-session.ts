import { encode } from 'next-auth/jwt';

/**
 * Test Session Helper
 *
 * Creates valid NextAuth JWT session tokens for testing without modifying
 * application code. Uses the same JWT encoding that NextAuth uses internally.
 *
 * This approach:
 * - Reuses NextAuth's own JWT library
 * - Creates tokens the app will accept as valid
 * - Requires no changes to application code
 * - Safe for testing only (uses NEXTAUTH_SECRET from env)
 */

export interface TestUser {
  id: number;
  name: string;
  role: 'admin' | 'active' | 'nakki';
}

/**
 * Default test user matching the seeded test data
 */
export const DEFAULT_TEST_USER: TestUser = {
  id: 999999999,
  name: 'Test User',
  role: 'active',
};

/**
 * Create a valid NextAuth JWT session token
 *
 * This token can be injected as a cookie to authenticate test requests.
 * The app will accept it as a valid session because it's signed with
 * the same secret and has the correct structure.
 */
export async function createTestSessionToken(
  user: TestUser = DEFAULT_TEST_USER
): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required for tests');
  }

  // Create JWT token with the same structure NextAuth uses
  // Based on the session callback in src/server/auth.ts
  const token = await encode({
    token: {
      userId: user.id,
      role: user.role,
      sub: user.id.toString(), // NextAuth requires 'sub' claim
      name: user.name,
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Expires in 30 days
    },
    secret,
  });

  return token;
}

/**
 * Get the NextAuth session cookie name
 *
 * NextAuth uses different cookie names for HTTP vs HTTPS:
 * - HTTP: 'next-auth.session-token'
 * - HTTPS: '__Secure-next-auth.session-token'
 *
 * Since tests run against HTTPS (dev.docker.orb.local), we use the secure variant.
 */
export function getSessionCookieName(): string {
  return '__Secure-next-auth.session-token';
}
