# HYTKY

Site and forum for a student organization centered around electronic music culture. This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Running

### Requirements:
- Docker Compose
- Make

### Instructions
- git clone <this repo>
- cd hytky
- make dev

### Making changes to the database
In a development environment, use the `make migrate` command to generate and apply migrations.
Commit the following to source control:
- The entire migration history folder
- The schema.prisma file

## Deployment

Deployed using Docker Compose 
Pushing a new image to GHCR will trigger deployment.  
To push a new image, tag a commit on the main branch with a semantic version number.

## TODO
- make migrate creates migrations
- `docker-compose -f docker-compose.yml up -d --build --env NODE_ENV=production` applies database migrations in prod
- Allow image submissions to posts and store them in minio (S3)
- use Watchtower to deploy production Docker image
- certbot container automatically fetches https cert for nginx container
