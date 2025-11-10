import { env } from '~/env.mjs';

/**
 * Environment Variable Validation Tests
 *
 * These tests ensure all required environment variables are properly defined.
 * This prevents runtime errors like "Failed to parse URL from undefined"
 * that can occur when environment variables are missing.
 */
describe('Environment Variables', () => {
  describe('Server Environment Variables', () => {
    it('should have DATABASE_URL defined', () => {
      expect(env.DATABASE_URL).toBeDefined();
      expect(typeof env.DATABASE_URL).toBe('string');
      expect(env.DATABASE_URL.length).toBeGreaterThan(0);
    });

    it('should have NEXTAUTH_SECRET defined', () => {
      expect(env.NEXTAUTH_SECRET).toBeDefined();
      expect(typeof env.NEXTAUTH_SECRET).toBe('string');
      expect(env.NEXTAUTH_SECRET.length).toBeGreaterThan(0);
    });

    it('should have NEXTAUTH_URL defined', () => {
      expect(env.NEXTAUTH_URL).toBeDefined();
      expect(typeof env.NEXTAUTH_URL).toBe('string');
      expect(env.NEXTAUTH_URL.length).toBeGreaterThan(0);
    });

    it('should have TG_BOT_TOKEN defined', () => {
      expect(env.TG_BOT_TOKEN).toBeDefined();
      expect(typeof env.TG_BOT_TOKEN).toBe('string');
      expect(env.TG_BOT_TOKEN.length).toBeGreaterThan(0);
    });

    it('should have FORUM_ROOT_NAME defined', () => {
      expect(env.FORUM_ROOT_NAME).toBeDefined();
      expect(typeof env.FORUM_ROOT_NAME).toBe('string');
      expect(env.FORUM_ROOT_NAME.length).toBeGreaterThan(0);
    });

    it('should have HYTKYBOT_URL defined and be a valid URL', () => {
      expect(env.HYTKYBOT_URL).toBeDefined();
      expect(typeof env.HYTKYBOT_URL).toBe('string');
      expect(env.HYTKYBOT_URL.length).toBeGreaterThan(0);

      // Verify it's a valid URL (this would have prevented the original bug)
      expect(() => new URL(env.HYTKYBOT_URL)).not.toThrow();

      // Additional check: ensure it's not literally "undefined"
      expect(env.HYTKYBOT_URL).not.toBe('undefined');
    });
  });

  describe('Client Environment Variables', () => {
    it('should have NEXT_PUBLIC_TG_BOT_NAME defined', () => {
      expect(env.NEXT_PUBLIC_TG_BOT_NAME).toBeDefined();
      expect(typeof env.NEXT_PUBLIC_TG_BOT_NAME).toBe('string');
      expect(env.NEXT_PUBLIC_TG_BOT_NAME.length).toBeGreaterThan(0);
    });

    it('should have NEXT_PUBLIC_TG_INFO_CHANNEL defined', () => {
      expect(env.NEXT_PUBLIC_TG_INFO_CHANNEL).toBeDefined();
      expect(typeof env.NEXT_PUBLIC_TG_INFO_CHANNEL).toBe('string');
      expect(env.NEXT_PUBLIC_TG_INFO_CHANNEL.length).toBeGreaterThan(0);
    });
  });

  describe('URL Format Validation', () => {
    it('DATABASE_URL should be a valid PostgreSQL connection string', () => {
      expect(env.DATABASE_URL).toMatch(/^postgres(ql)?:\/\//);
    });

    it('NEXTAUTH_URL should be a valid HTTP/HTTPS URL', () => {
      expect(env.NEXTAUTH_URL).toMatch(/^https?:\/\//);
      expect(() => new URL(env.NEXTAUTH_URL)).not.toThrow();
    });

    it('HYTKYBOT_URL should be a valid HTTP/HTTPS URL', () => {
      expect(env.HYTKYBOT_URL).toMatch(/^https?:\/\//);
      expect(() => new URL(env.HYTKYBOT_URL)).not.toThrow();
    });
  });

  describe('Critical Path: checkUserRole dependency', () => {
    it('should have HYTKYBOT_URL that can be used with fetch()', () => {
      // This test specifically catches the bug we fixed where HYTKYBOT_URL was undefined
      // When fetch() receives undefined, it throws: "Failed to parse URL from undefined"

      expect(env.HYTKYBOT_URL).toBeDefined();
      expect(env.HYTKYBOT_URL).not.toBe('undefined');

      // Verify the URL can be parsed (this is what fetch() does internally)
      const url = new URL(env.HYTKYBOT_URL);
      expect(url.protocol).toMatch(/^https?:$/);
      expect(url.hostname).toBeTruthy();
    });
  });
});
