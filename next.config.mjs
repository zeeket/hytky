// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

/** @type {import("next").NextConfig} */
const config = {
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    // @ts-ignore
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              // Some source SVGs have a viewBox matching their width/height
              // exactly; SVGO's default preset treats that as redundant and
              // strips it, which breaks scaling these icons via CSS.
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    config.externals.push({
      sharp: 'commonjs sharp',
    });

    return config;
  },
  reactStrictMode: true,
  output: 'standalone',
  /**
   * Local development is served over HTTPS on https://local.hytky.org (a
   * public A record pointing at 127.0.0.1) so that Telegram's OIDC provider
   * accepts the redirect URI. Without this, `next dev` warns about — and in
   * future versions blocks — requests arriving under that host.
   */
  allowedDevOrigins: ['local.hytky.org'],
  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ['fi', 'en'],
    defaultLocale: 'fi',
    localeDetection: false,
  },
};
export default config;
