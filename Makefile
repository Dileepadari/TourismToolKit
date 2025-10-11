.PHONY: help build up down restart logs clean seed backup

help: ## Show this help message
	@echo 'Tourism Toolkit - Docker Commands'
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker compose build

up: ## Start all services
	docker compose up -d
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  GraphQL:  http://localhost:8000/graphql"

up-build: ## Build and start all services
	docker compose up -d --build
	@echo "✓ Services built and started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  GraphQL:  http://localhost:8000/graphql"

down: ## Stop all services
	docker compose down

down-v: ## Stop all services and remove volumes (⚠️ deletes data)
	docker compose down -v

restart: ## Restart all services
	docker compose restart

restart-backend: ## Restart backend service only
	docker compose restart backend

restart-frontend: ## Restart frontend service only
	docker compose restart frontend

logs: ## View logs from all services
	docker compose logs -f

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-frontend: ## View frontend logs
	docker compose logs -f frontend

logs-db: ## View database logs
	docker compose logs -f db

ps: ## List running containers
	docker compose ps

seed: ## Re-seed database
	docker compose exec backend python -c "from app.database.seed_data import seed_all; seed_all()"

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-db: ## Open PostgreSQL shell
	docker compose exec db psql -U tourism_user -d tourism_db

backup: ## Backup database to backup.sql
	docker compose exec db pg_dump -U tourism_user tourism_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Database backed up!"

restore: ## Restore database from backup.sql (requires backup.sql file)
	@read -p "Enter backup file path: " backup; \
	docker compose exec -T db psql -U tourism_user tourism_db < $$backup
	@echo "✓ Database restored!"

clean: ## Stop services and clean up Docker resources
	docker compose down -v
	docker system prune -f
	@echo "✓ Cleaned up!"

health: ## Check service health status
	@docker compose ps | grep -E "(healthy|Up)"

dev: ## Start development environment
	@echo "Starting development environment..."
	docker compose up -d db
	@echo "✓ Database started. Use pm2 for backend/frontend in development mode."

stop-local: ## Stop local PM2 processes
	pm2 stop all

migrate: ## Run database migrations
	docker compose exec backend alembic upgrade head

migration: ## Create a new migration
	@read -p "Enter migration message: " msg; \
	docker compose exec backend alembic revision --autogenerate -m "$$msg"
