.PHONY: dev rmi prod rmip migrate baseline testconnect prepareprod startprod help

SHELL := /bin/bash
MYPATH := $(shell pwd)

SSH_KEY = $(HOME)/.ssh/id_rsa

# Start the local development environment with hot-reloading. Usage: 'make dev'.
dev:
	docker-compose -f docker/docker-compose.dev.yml up --force-recreate

# Remove local development images and volumes. Usage: 'make rmi'.
rmi:
	docker-compose -f docker/docker-compose.dev.yml down --rmi=local

# Start a production-like environment locally. Usage: 'make prod'.
prod:
	docker-compose -f docker/docker-compose.prod.yml up --force-recreate

# Remove local production-like images and volumes. Usage: 'make rmip'.
rmip:
	docker-compose -f docker/docker-compose.prod.yml down --rmi=local

# Create a databse migration. Use when making changes to the prisma/schema.prisma file. Usage: 'make migrate'.
migrate:
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --env-file ./.env --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 -it --entrypoint "pnpx" hytky-dbsync prisma migrate dev

# Create a baseline migration. You should probably never use this. Usage: 'make baseline'.
baseline:
	mkdir -p prisma/migrations/0_init
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 --env-file ./.env -it --entrypoint /bin/sh hytky-dbsync -c "pnpx prisma db pull && \
	pnpx prisma migrate diff \
	--from-empty \
	--to-schema-datamodel prisma/schema.prisma \
	--script > prisma/migrations/0_init/migration.sql && \
	pnpx prisma migrate resolve --applied 0_init"

# Seed the (production) database. This should only be required after 'make prod'. Usage: 'make seed'.
seed:
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --network hytky-prod_default --platform linux/amd64 --env-file ./.env -it --entrypoint "pnpx" hytky-dbsync prisma db seed

# Test connection to the server at the address given. Usage: 'make testconnect IP=123.123.123.123'.
testconnect:
	ansible -i $(IP), -u root --private-key=$(SSH_KEY) all -m ping

# Prepare production environment at the address given. Usage: 'make prepareprod IP=123.123.123.123'.
prepareprod:
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/install-docker-compose.yml -e @ansible/vars.yml
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/copy-files-to-production.yml

# Start production environment at the address given. Usage: 'make startprod IP=123.123.123.123'.
startprod:
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/start-production.yml

# Show this help. Usage: 'make help'.
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z]+:' Makefile | grep -v '^\.PHONY:' | sed -e 's/:.*//' -e 's/^/  /' -e 's/^/ /'
	@echo ""
	@grep -E '^#.*' Makefile | sed -e 's/^# //' -e 's/^/  /' -e 's/^/ /'
