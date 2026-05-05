-- Enable trigram extension for fast case-insensitive substring search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes so that Prisma's `contains + mode:'insensitive'` (ILIKE '%q%')
-- is index-scanned instead of doing a full sequential scan.
CREATE INDEX "Category_name_trgm_idx" ON "Category" USING GIN (name gin_trgm_ops);
CREATE INDEX "Thread_name_trgm_idx" ON "Thread" USING GIN (name gin_trgm_ops);
