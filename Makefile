.PHONY: dev rmi prod rmip migrate baseline testconnect prepareprod startprod generate-internal-api-secret sync-calendar help

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
		pnpm exec eslint .; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpm exec eslint .; \
	fi

# Run the linter and fix errors. Usage: 'make lintfix'.
lintfix:
	if command -v pnpm &> /dev/null; then \
		pnpm exec eslint . --fix; \
	else \
		docker build -t hytky-dev-lint -f docker/Dockerfile.dev . > /dev/null 2>&1; \
		docker run --rm --platform linux/amd64 --env-file .env -v ./:/app -v /app/node_modules/ hytky-dev-lint pnpm exec eslint . --fix; \
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

# Run all tests (unit + e2e) with coverage reports. Usage: 'make test'.
test:
	@echo "Checking dev environment status..."
	@if ! docker compose -f docker/docker-compose.dev.yml ps --services --filter "status=running" | grep -q "dev"; then \
		echo "Dev environment not running. Starting it now..."; \
		docker compose -f docker/docker-compose.dev.yml up -d; \
		echo "Waiting for services to be ready..."; \
		timeout 45 bash -c 'until curl -k -s -f https://dev.docker.orb.local > /dev/null 2>&1; do sleep 2; done' || (echo "Service failed to start within 45 seconds" && exit 1); \
		echo "Dev environment is ready!"; \
	else \
		echo "Dev environment already running."; \
	fi
	@echo ""
	@echo "Running all tests (unit + e2e)..."
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "1. Running Unit Tests (Server-Side)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@pnpm test:unit:coverage
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "2. Running E2E Tests (Client-Side)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@rm -rf .nyc_output coverage
	@pnpm exec playwright test --project=chromium
	@echo ""
	@echo "E2E Coverage Summary:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@pnpm exec c8 report --config tests/.c8rc.json 2>/dev/null || echo "No coverage data collected"
	@echo ""
	@node tests/scripts/uncovered-lines.js
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Coverage Reports:"
	@echo "  - Server-side (unit tests): coverage-jest/index.html"
	@echo "  - Client-side (e2e tests):  coverage/index.html"

# Run the unit tests with coverage report. Usage: 'make test-unit'.
test-unit:
	@pnpm test:unit:coverage

# Run the e2e tests with coverage report. Usage: 'make test-e2e'.
test-e2e:
	@echo "Checking dev environment status..."
	@if ! docker compose -f docker/docker-compose.dev.yml ps --services --filter "status=running" | grep -q "dev"; then \
		echo "Dev environment not running. Starting it now..."; \
		docker compose -f docker/docker-compose.dev.yml up -d; \
		echo "Waiting for services to be ready..."; \
		timeout 45 bash -c 'until curl -k -s -f https://dev.docker.orb.local > /dev/null 2>&1; do sleep 2; done' || (echo "Service failed to start within 45 seconds" && exit 1); \
		echo "Dev environment is ready!"; \
	else \
		echo "Dev environment already running."; \
	fi
	@echo ""
	@rm -rf .nyc_output coverage
	@pnpm exec playwright test --project=chromium
	@echo ""
	@echo "Coverage Summary:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@pnpm exec c8 report --config tests/.c8rc.json 2>/dev/null || echo "No coverage data collected"
	@echo ""
	@node tests/scripts/uncovered-lines.js
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Full HTML report available at: coverage/index.html"

# Run e2e tests with all browsers (chromium, firefox, webkit). Usage: 'make test-all'.
test-all:
	@echo "Checking dev environment status..."
	@if ! docker compose -f docker/docker-compose.dev.yml ps --services --filter "status=running" | grep -q "dev"; then \
		echo "Dev environment not running. Starting it now..."; \
		docker compose -f docker/docker-compose.dev.yml up -d; \
		echo "Waiting for services to be ready..."; \
		timeout 45 bash -c 'until curl -k -s -f https://dev.docker.orb.local > /dev/null 2>&1; do sleep 2; done' || (echo "Service failed to start within 45 seconds" && exit 1); \
		echo "Dev environment is ready!"; \
	else \
		echo "Dev environment already running."; \
	fi
	@echo ""
	@rm -rf .nyc_output coverage
	@pnpm exec playwright test --project=chromium --project=firefox --project=webkit
	@echo ""
	@echo "Coverage Summary:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@pnpm exec c8 report --config tests/.c8rc.json 2>/dev/null || echo "No coverage data collected"
	@echo ""
	@node tests/scripts/uncovered-lines.js
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Full HTML report available at: coverage/index.html"

# Start a production-like environment locally. Usage: 'make prod'.
prod:
	docker compose -f docker/docker-compose.prod.yml up --force-recreate

# Start production environment locally using images from the container registry. Usage: 'make regprod'.
regprod:
	docker compose -f docker/docker-compose.prod.from-registry.yml up 

# Remove local production-like images and volumes. Usage: 'make rmip'.
rmip:
	docker compose -f docker/docker-compose.prod.yml down --rmi=local

# Create a databse migration. Use when making changes to the prisma/schema.prisma file. Usage: 'make migrate' or 'make migrate NAME=add_feature'.
migrate:
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	@if [ -t 0 ]; then \
		docker run --env-file ./.env --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 -it hytky-dbsync pnpm exec prisma migrate dev $(if $(NAME),--name $(NAME),); \
	else \
		docker run --env-file ./.env --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 -i hytky-dbsync pnpm exec prisma migrate dev $(if $(NAME),--name $(NAME),); \
	fi

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

# Generate a secure INTERNAL_API_SECRET. Usage: 'make generate-internal-api-secret'.
generate-internal-api-secret:
	@echo "Generated INTERNAL_API_SECRET:"
	@openssl rand -hex 32

# Trigger a manual calendar sync. Usage: 'make sync-calendar'.
sync-calendar:
	@echo "Triggering calendar sync..."
	@curl -X POST http://localhost:3002/sync -H "Content-Type: application/json" || \
		(docker compose -f docker/docker-compose.dev.yml exec -T gcalservice curl -X POST http://localhost:3002/sync -H "Content-Type: application/json" || \
		echo "Failed to trigger sync. Make sure gcalservice is running.")

# Show this help. Usage: 'make help'.
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z]+:' Makefile | grep -v '^\.PHONY:' | sed -e 's/:.*//' -e 's/^/  /' -e 's/^/ /'
	@echo ""
	@grep -E '^#.*' Makefile | sed -e 's/^# //' -e 's/^/  /' -e 's/^/ /'
