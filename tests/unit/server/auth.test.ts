import { authOptions } from '~/server/auth';

/**
 * Auth Redirect Callback Tests
 *
 * Tests for the redirect callback in NextAuth configuration to ensure
 * proper handling of same-origin redirects, especially when baseUrl
 * includes a path component.
 */
describe('authOptions.redirect callback', () => {
  const redirectCallback = authOptions.callbacks?.redirect;

  if (!redirectCallback) {
    throw new Error('redirect callback not found in authOptions');
  }

  describe('relative URL handling', () => {
    it('should prepend baseUrl to relative URLs', async () => {
      const result = await redirectCallback({
        url: '/forum',
        baseUrl: 'https://example.com',
      });

      expect(result).toBe('https://example.com/forum');
    });

    it('should prepend baseUrl with path to relative URLs', async () => {
      const result = await redirectCallback({
        url: '/forum',
        baseUrl: 'https://example.com/app',
      });

      expect(result).toBe('https://example.com/app/forum');
    });
  });

  describe('same-origin URL handling', () => {
    it('should preserve same-origin URL when baseUrl has no path', async () => {
      const result = await redirectCallback({
        url: 'https://example.com/forum',
        baseUrl: 'https://example.com',
      });

      expect(result).toBe('https://example.com/forum');
    });

    it('should preserve same-origin URL when baseUrl has a path', async () => {
      // This is the bug case: baseUrl includes a path, but the URL is same-origin
      // Current implementation will fail this because:
      // - new URL(url).origin = "https://example.com"
      // - baseUrl = "https://example.com/app"
      // - Comparison fails, falls through to return baseUrl instead of url
      const result = await redirectCallback({
        url: 'https://example.com/forum',
        baseUrl: 'https://example.com/app',
      });

      // Expected: should return the original URL since it's same-origin
      // Current buggy behavior: returns baseUrl instead
      expect(result).toBe('https://example.com/forum');
    });

    it('should preserve same-origin URL with query params when baseUrl has a path', async () => {
      const result = await redirectCallback({
        url: 'https://example.com/forum?thread=123',
        baseUrl: 'https://example.com/app',
      });

      expect(result).toBe('https://example.com/forum?thread=123');
    });

    it('should preserve same-origin URL with hash when baseUrl has a path', async () => {
      const result = await redirectCallback({
        url: 'https://example.com/forum#section',
        baseUrl: 'https://example.com/app',
      });

      expect(result).toBe('https://example.com/forum#section');
    });
  });

  describe('cross-origin URL handling', () => {
    it('should return baseUrl for different origin', async () => {
      const result = await redirectCallback({
        url: 'https://malicious.com/steal',
        baseUrl: 'https://example.com',
      });

      expect(result).toBe('https://example.com');
    });

    it('should return baseUrl for different origin even when baseUrl has path', async () => {
      const result = await redirectCallback({
        url: 'https://malicious.com/steal',
        baseUrl: 'https://example.com/app',
      });

      expect(result).toBe('https://example.com/app');
    });

    it('should return baseUrl for different protocol', async () => {
      const result = await redirectCallback({
        url: 'http://example.com/forum',
        baseUrl: 'https://example.com',
      });

      expect(result).toBe('https://example.com');
    });

    it('should return baseUrl for different port', async () => {
      const result = await redirectCallback({
        url: 'https://example.com:8080/forum',
        baseUrl: 'https://example.com',
      });

      expect(result).toBe('https://example.com');
    });
  });

  describe('edge cases', () => {
    it('should handle baseUrl with trailing slash', async () => {
      const result = await redirectCallback({
        url: 'https://example.com/forum',
        baseUrl: 'https://example.com/app/',
      });

      expect(result).toBe('https://example.com/forum');
    });

    it('should handle baseUrl with multiple path segments', async () => {
      const result = await redirectCallback({
        url: 'https://example.com/forum',
        baseUrl: 'https://example.com/app/v1/api',
      });

      expect(result).toBe('https://example.com/forum');
    });

    it('should handle URL with port matching baseUrl origin', async () => {
      const result = await redirectCallback({
        url: 'https://example.com:443/forum',
        baseUrl: 'https://example.com:443/app',
      });

      expect(result).toBe('https://example.com:443/forum');
    });
  });
});
