SHELL := /bin/bash
dev:
	docker-compose -f docker/docker-compose.dev.yml up
rmi:
	docker-compose -f docker/docker-compose.dev.yml down --rmi=local
