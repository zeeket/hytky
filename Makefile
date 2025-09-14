.PHONY: dev rmi prod rmip migrate baseline testconnect prepareprod startprod help

SHELL := /bin/bash
MYPATH := $(shell pwd)

SSH_KEY = $(HOME)/.ssh/id_rsa

# Start the local development environment with hot-reloading. Usage: 'make dev'.
dev:
	docker compose -f docker/docker-compose.dev.yml up --force-recreate

# Remove local development images and volumes. Usage: 'make rmi'.
rmi:
	docker compose -f docker/docker-compose.dev.yml down --rmi=local

# Run the linter check. Usage: 'make lint'.
lint:
	if command -v pnpm &> /dev/null; then \
		pnpm exec eslint . --ext .js,.jsx,.ts,.tsx; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpm exec eslint . --ext .js,.jsx,.ts,.tsx; \
	fi

# Run the linter and fix errors. Usage: 'make lintfix'.
lintfix:
	if command -v pnpm &> /dev/null; then \
		pnpm exec eslint . --ext .js,.jsx,.ts,.tsx --fix; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpm exec eslint . --ext .js,.jsx,.ts,.tsx --fix; \
	fi

# Run the code style check. Usage: 'make prettier'.
prettier:
	if command -v pnpm &> /dev/null; then \
		pnpx prettier . --check; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpx prettier . --check; \
	fi

# Run the code style check and fix errors. Usage: 'make prettierfix'.
prettierfix:
	if command -v pnpm &> /dev/null; then \
		pnpx prettier . --write; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpx prettier . --write; \
	fi

# Run the tests. Usage: 'make test'.
test:
	pnpm exec playwright test

# Start a production-like environment locally. Usage: 'make prod'.
prod:
	docker compose -f docker/docker-compose.prod.yml up --force-recreate

# Start production environment locally using images from the container registry. Usage: 'make regprod'.
regprod:
	docker compose -f docker/docker-compose.prod.from-registry.yml up 

# Remove local production-like images and volumes. Usage: 'make rmip'.
rmip:
	docker compose -f docker/docker-compose.prod.yml down --rmi=local

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
	docker run --network docker_default --platform linux/amd64 --env-file ./.env -it --entrypoint "pnpx" hytky-dbsync ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# Test connection to the server at the address given. Usage: 'make testconnect IP=123.123.123.123'.
testconnect:
	ansible -i $(IP), -u root --private-key=$(SSH_KEY) all -m ping

# Prepare production environment at the address given. Usage: 'make prepareprod IP=123.123.123.123 DOMAIN=example.com CERTBOT_EMAIL=ex@mpl.ee'.
prepareprod:
ifeq ($(MAKECMDGOALS),prepareprod)
ifndef IP
ifndef DOMAIN
	$(error DOMAIN is not defined. Usage: make prepareprod DOMAIN=yourdomain.com CERTBOT_EMAIL=youremail@example.com)
endif 
ifndef CERTBOT_EMAIL
	$(error CERTBOT_EMAIL is not defined. Usage: make prepareprod DOMAIN=yourdomain.com CERTBOT_EMAIL=youremail@example.com)
endif
endif
ifdef IP
ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/install-docker-compose.yml -e @ansible/vars.yml	
ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/copy-files-to-production.yml
endif
ifdef DOMAIN
ifdef CERTBOT_EMAIL
	ansible-playbook -i $(DOMAIN), --user=root --private-key=$(SSH_KEY) ansible/install-docker-compose.yml -e @ansible/vars.yml
	ansible-playbook -i $(DOMAIN), --user=root --private-key=$(SSH_KEY) ansible/copy-files-to-production.yml -e "domain=$(DOMAIN) certbot_email=$(CERTBOT_EMAIL)"
endif
endif
endif

# Start production environment at the address given. Usage: 'make startprod IP=123.123.123.123'.
startprod:
ifeq ($(MAKECMDGOALS),startprod)
ifndef IP
ifndef DOMAIN
    $(error DOMAIN is not defined. Usage: make prepareprod DOMAIN=yourdomain.com or make startprod IP=)
endif
	ansible-playbook -i $(DOMAIN), --user=root --private-key=$(SSH_KEY) ansible/start-production-https.yml
endif
ifdef IP
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/start-production-http.yml
endif
endif

# Show this help. Usage: 'make help'.
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z]+:' Makefile | grep -v '^\.PHONY:' | sed -e 's/:.*//' -e 's/^/  /' -e 's/^/ /'
	@echo ""
	@grep -E '^#.*' Makefile | sed -e 's/^# //' -e 's/^/  /' -e 's/^/ /'
