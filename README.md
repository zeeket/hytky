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

## Deployment

Deployed using Docker Compose 
Pushing a new image to GHCR will trigger deployment.  
To push a new image, tag a commit on the main branch with a semantic version number.

## TODO
- Make threads work (threads are contained in categories)
- Allow image submissions to posts and store them in minio (S3)
- use Watchtower to deploy production Docker image
- use LB for "rollover" 0-downtime update
