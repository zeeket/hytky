# HYTKY

[![Prettier](https://github.com/zeeket/hytky/actions/workflows/prettier-check.yml/badge.svg)](https://github.com/zeeket/hytky/actions/workflows/prettier-check.yml)
[![ESLint](https://github.com/zeeket/hytky/actions/workflows/next-lint-check.yml/badge.svg)](https://github.com/zeeket/hytky/actions/workflows/next-lint-check.yml)

[![Playwright Tests](https://img.shields.io/badge/Playwright-34%2F34%20tests%20passing-brightgreen)](https://github.com/zeeket/hytky/actions/workflows/playwright.yml)
[![Jest Tests](https://img.shields.io/badge/Jest-34%2F34%20tests%20passing-brightgreen)](https://github.com/zeeket/hytky/actions/workflows/playwright.yml)

[![Combined Test Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zeeket/hytky/main/.github/badges/coverage-combined.json)](.github/badges/coverage-combined.json)
[![Jest Test Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zeeket/hytky/main/.github/badges/coverage-jest.json)](.github/badges/coverage-jest.json)
[![Playwright Test Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zeeket/hytky/main/.github/badges/coverage-playwright.json)](.github/badges/coverage-playwright.json)

Site and forum for a student organization centered around electronic music culture. This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.
The forum login is designed to be exclusive to members of certain Telegram groups. A Telegram user's membership status in the groups is checked with [HYTKYbot](https://github.com/zeeket/HYTKYbot).

## Running

### Requirements

- Docker Compose
- Make

### Recommended

- Node.js
- pnpm

### Instructions

1. `git clone <this repo>`
2. `cd hytky`
3. `cp .env.example .env` and put your secret values in the `.env` file.
4. `cp .hytkybot.env.example .hytkybot.env` and put your secret values in the `.hytkybot.env` file.
5. Generate an `INTERNAL_API_SECRET` for service-to-service authentication:
   ```bash
   make generate-internal-api-secret
   ```
   Add this value to both `.env` (as `INTERNAL_API_SECRET`) and `.gcalservice.env` (if using the calendar service).
6. `make dev` for hot reloading **or** `make prod` for a production-like environment.
   - Production environments should be seeded manually with `make seed`

### Making changes to the database

In a development environment, use the `make migrate` command to generate and apply migrations.
Commit the following to source control:

- The entire migration history folder
- The schema.prisma file

### Testing Calendar Sync

To manually trigger a calendar sync (useful for testing):

1. **Using Make (recommended):**
   ```bash
   make sync-calendar
   ```

2. **Using curl directly (if port 3002 is exposed):**
   ```bash
   curl -X POST http://localhost:3002/sync
   ```

3. **From within Docker network:**
   ```bash
   docker compose -f docker/docker-compose.dev.yml exec gcalservice curl -X POST http://localhost:3002/sync
   ```

4. **Check health status:**
   ```bash
   curl http://localhost:3002/health
   ```

The sync will:
- Fetch events from Google Calendar
- Send them to the main app via the authenticated API
- Update the sync state in the database

## Deployment

The username of the Telegram bot that is used for the Telegram login button on the login page is stored as a variable on this GitHub repo. This is because we want to serve the login page with SSG from the container.
To change the value to point to your own [HYTKYbot](https://github.com/zeeket/HYTKYbot):

1. Fork this repo.
2. Add the NEXT_PUBLIC_TG_BOT_NAME variable containing your bot's username to your forked repository.
3. Edit [docker/docker-compose.prod.from-registry.yml](docker/docker-compose.prod.from-registry.yml) to point to your GHCR.

You should then be able to fetch the latest working image from your GHCR and simulate a deployment locally with `make regprod`

### Deployment requirements

- [Ansible](https://github.com/ansible/ansible) & access to a x86_64 `apt` based Linux production server

### Initial deployment instructions

Replace 123.123.123.123 with your server's IP. Makefile asssumes you authenticate with `~/.ssh/id_rsa`.

1. `make testconnect IP=123.123.123.123` should succeed
2. `make prepareprod IP=123.123.123.123`
3. `make startprod IP=123.123.123.123`

### Continuous delivery

To push a new image, `git tag` a commit on the main branch with a semantic version number (for example `v1.0.0`).
Latest image should get picked up by [Watchtower](https://containrrr.dev/watchtower/).

## TODO

- Allow image submissions to posts and store them in minio (S3).
- English language option for forum UI.
- Seed db from JSON if `prisma/eventArchive.json` or `prisma/forumArchive.json` exist.
- Remotely back up a deployment's database to `prisma/forumBackup.json` with a command.
- Use src/server/utis/validators
- Use toasts
- Calendar integration that updates events page
