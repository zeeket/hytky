# HYTKY

Site and forum for a student organization centered around electronic music culture. This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Running

### Requirements:
- Docker Compose
- Make

### Instructions
- `git clone <this repo>`
- `cd hytky`
- `cp .env.example .env` and put your secret values in the `.env` file.
- `cp .hytkybot.env.example .hytkybot.env` and put your secret values in the `.hytkybot.env` file.
- `make dev` for hot reloading **or** `make prod` for a production-like environment.

### Making changes to the database
In a development environment, use the `make migrate` command to generate and apply migrations.
Commit the following to source control:
- The entire migration history folder
- The schema.prisma file

## Deployment
  
 ### Requirements:
  - Ansible (also on the x86_64 Linux production server)

### Instructions (initial deployment)
Replace 123.123.123.123 with your server's IP. Makefile asssumes you authenticate with `~/.ssh/id_rsa`.
  - `make testconnect IP=123.123.123.123` should succeed
  - `make prepareprod IP=123.123.123.123`
  - `make startprod IP=123.123.123.123`
  
### Instructions (continuous delivery)
To push a new image, `git tag` a commit on the main branch with a semantic version number (for example `v1.0.0`).
Latest image should get picked up by [Watchtower](https://containrrr.dev/watchtower/).

## TODO
- Allow image submissions to posts and store them in minio (S3)
- use Watchtower to deploy production Docker image
- certbot container automatically fetches https cert for nginx container
