#!/bin/sh
pnpm prisma generate && pnpm prisma db push && ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts && pnpm run dev
