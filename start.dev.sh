#!/bin/sh
pnpm prisma generate && pnpm prisma db push && ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts || exit 1

# Serve HTTPS directly from `next dev` when local certificates are mounted at
# /certs (see "Local HTTPS" in the README). Telegram's OIDC provider only
# accepts redirect URIs on registered HTTPS domains, so logging in locally
# needs TLS; without the certificates this falls back to plain HTTP on $PORT
# so the default `make dev` flow keeps working unchanged.
if [ -f /certs/local.hytky.org.pem ] && [ -f /certs/local.hytky.org-key.pem ]; then
  echo "[dev] certificates found, serving https://local.hytky.org"
  exec pnpm exec next dev --port 443 \
    --experimental-https \
    --experimental-https-key /certs/local.hytky.org-key.pem \
    --experimental-https-cert /certs/local.hytky.org.pem
else
  exec pnpm run dev
fi
