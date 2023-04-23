#!/bin/sh
pnpm prisma generate && pnpm prisma db push && pnpm prisma db seed && pnpm run dev
