.PHONY: dev rmi prod rmip migrate baseline testconnect prepareprod startprod

SHELL := /bin/bash
MYPATH := $(shell pwd)

SSH_KEY = $(HOME)/.ssh/id_rsa

dev:
	docker-compose -f docker/docker-compose.dev.yml up --force-recreate
	
rmi:
	docker-compose -f docker/docker-compose.dev.yml down --rmi=local

prod:
	docker-compose -f docker/docker-compose.prod.yml up --force-recreate

rmip:
	docker-compose -f docker/docker-compose.prod.yml down --rmi=local

migrate:
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --env-file ./.env --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 -it --entrypoint "pnpx" hytky-dbsync prisma migrate dev

baseline:
	mkdir -p prisma/migrations/0_init
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --network docker_default -v $(MYPATH)/prisma:/app/prisma --platform linux/amd64 --env-file ./.env -it --entrypoint /bin/sh hytky-dbsync -c "pnpx prisma db pull && \
	pnpx prisma migrate diff \
	--from-empty \
	--to-schema-datamodel prisma/schema.prisma \
	--script > prisma/migrations/0_init/migration.sql && \
	pnpx prisma migrate resolve --applied 0_init"

seed:
	docker build -f docker/Dockerfile.dbsync --platform linux/amd64 -t hytky-dbsync .
	docker run --network hytky-prod_default --platform linux/amd64 --env-file ./.env -it --entrypoint "pnpx" hytky-dbsync prisma db seed

testconnect:
	ansible -i $(IP), -u root --private-key=$(SSH_KEY) all -m ping

prepareprod:
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/install-docker-compose.yml -e @ansible/vars.yml
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/copy-files-to-production.yml

startprod:
	ansible-playbook -i $(IP), --user=root --private-key=$(SSH_KEY) ansible/start-production.yml