#!/bin/sh
# Resolves the base URL of the local dev environment. Used by the Makefile both
# to wait for the environment and to tell Playwright where to point, so the two
# can never disagree. Must not depend on the environment already being up.
#
# Priority:
#   1. PLAYWRIGHT_BASE_URL from the environment
#   2. PLAYWRIGHT_BASE_URL from .env
#   3. https://local.hytky.org when local certificates are present, since
#      `start.dev.sh` then serves TLS on 443 (see "Local HTTPS" in the README)
#   4. http://localhost — port 80 as published by docker-compose.dev.yml
set -e

if [ -n "$PLAYWRIGHT_BASE_URL" ]; then
  echo "$PLAYWRIGHT_BASE_URL"
elif [ -f .env ] && grep -q '^PLAYWRIGHT_BASE_URL=.' .env; then
  # Strip the key, then any surrounding quotes (octal escapes: " and ').
  grep '^PLAYWRIGHT_BASE_URL=' .env | tail -n 1 | cut -d= -f2- | tr -d '\042\047'
elif [ -f certs/local.hytky.org.pem ]; then
  echo https://local.hytky.org
else
  echo http://localhost
fi
