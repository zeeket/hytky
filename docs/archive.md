# phpBB Archive Migration

Documents the one-time import of the legacy phpBB forum data into HYTKY's Prisma/PostgreSQL schema.

## What it does

The script `prisma/archive-import.mjs` reads a MySQL dump exported from the old phpBB installation and imports it into the live database under a top-level **Arkisto** category (`isArchive: true`).

- phpBB forums → `Category` rows nested under Arkisto
- phpBB topics → `Thread` rows
- phpBB posts → `Post` rows
- phpBB users → `User` rows with synthetic IDs (`archive-user-<phpbb_id>`) and names in the form `HYTKYbot(<username>)`
- Guest posts → `User` rows with IDs `archive-guest-<username>` derived from the post's stored username
- Hidden/deleted topics and posts (visibility ≠ 1) and shadow-move topics are skipped

The script is **idempotent in the safe direction**: it aborts immediately if an Arkisto category already exists under the forum root, so re-running it will never create duplicates.

## One-command production import

Run from the project root on your local machine:

```bash
node prisma/archive-import.mjs --upload path/to/dump-hytky.sql
```

This performs four steps automatically:

1. **rsync** the dump file to `hytky.org` (resumable if interrupted)
2. **rsync** the script itself to the server so the container always runs the latest version
3. **docker cp** both files into the running `hytky` container
4. **docker exec** the import inside the container using the container's own `DATABASE_URL`

Requires ssh key with access to `hytky.org` and `docker` permissions for that user.

## Local import (development)

```bash
node prisma/archive-import.mjs path/to/dump-hytky.sql
```

Reads `DATABASE_URL` from `.env`. When running on the host (outside Docker), the script automatically rewrites the `postgres` hostname to `localhost` so Prisma can reach the mapped port. This rewrite is skipped when running inside a container.

Default dump path if none is given: `../dbdumpscripting/dump-hytky.sql`

## The script is not in the container image

`archive-import.mjs` is a one-off migration tool, not part of the application runtime. Rather than adding it to the production image, `--upload` mode copies the local version of the script into the running container at import time. .

## Obtaining the dump

The dump is a standard MySQL logical dump (`mysqldump`) of the phpBB database. It must contain at minimum the following tables:

- `phpbb_users`
- `phpbb_forums`
- `phpbb_topics`
- `phpbb_posts`
