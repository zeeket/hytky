/**
 * Health check for the dev container.
 *
 * `start.dev.sh` serves HTTPS on 443 when local certificates are mounted and
 * plain HTTP on 80 otherwise, so probe both before reporting unhealthy.
 * Certificate validation is disabled because the dev certificate is issued by
 * a mkcert CA that is installed on the host, not inside this container.
 */
const targets = [
  { protocol: 'https', port: 443 },
  { protocol: 'http', port: 80 },
];

/** @param {{protocol: string, port: number}} target */
const probe = ({ protocol, port }) =>
  new Promise((resolve) => {
    const request = require(protocol).get(
      {
        host: 'localhost',
        port,
        path: '/api/health',
        rejectUnauthorized: false,
        timeout: 4000,
      },
      /** @param {import('http').IncomingMessage} response */
      (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      }
    );
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });

void (async () => {
  for (const target of targets) {
    if (await probe(target)) process.exit(0);
  }
  process.exit(1);
})();
