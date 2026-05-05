-- GIN trigram index on post content for fast case-insensitive substring search.
-- pg_trgm was already enabled in 20260504_add_search_indexes.
CREATE INDEX "Post_content_trgm_idx" ON "Post" USING GIN (content gin_trgm_ops);
