.PHONY: setup start stop restart logs logs-app logs-db status shell shell-db db-cli build clean destroy check help

# === LẦN ĐẦU TIÊN ===

setup: ## Cài đặt ban đầu (build image + khởi chạy)
	@echo "=== Movable Type 8.8.2 - Initial Setup ==="
	@echo ""
	@# Kiểm tra folder mt/ có source code chưa
	@if [ ! -f mt/mt.cgi ]; then \
		echo "!!! ERROR: Chưa có source code Movable Type !!!"; \
		echo ""; \
		echo "1. Download MT 8.8.2 từ https://www.movabletype.org/"; \
		echo "2. Giải nén vào folder ./mt/"; \
		echo "   tar xzf MT-8.8.2.tar.gz && mv MT-8.8.2/* mt/"; \
		echo ""; \
		echo "3. Chạy lại: make setup"; \
		exit 1; \
	fi
	@# Kiểm tra .env
	@if [ ! -f .env ]; then \
		echo "!!! ERROR: Chưa có file .env !!!"; \
		echo "Copy từ mẫu: cp .env.example .env"; \
		exit 1; \
	fi
	@echo ">> Building Docker images..."
	docker compose build
	@echo ""
	@echo ">> Starting services..."
	docker compose up -d
	@echo ""
	@echo "=== Setup hoàn tất ==="
	@echo ""
	@echo "  MT Admin:  http://localhost:$${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt.cgi"
	@echo "  MT Check:  http://localhost:$${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt-check.cgi"
	@echo ""
	@echo "  Xem logs:  make logs"
	@echo "  Dừng:      make stop"
	@echo ""

# === CHẠY HÀNG NGÀY ===

start: ## Khởi chạy (dùng cho những lần tiếp theo)
	@echo "=== Starting Movable Type ==="
	docker compose up -d
	@echo ""
	@echo "  MT Admin:  http://localhost:$${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt.cgi"
	@echo ""

stop: ## Dừng tất cả services
	docker compose down

restart: ## Restart tất cả services
	docker compose restart

# === LOGS ===

logs: ## Xem logs tất cả services (follow)
	docker compose logs -f

logs-app: ## Xem logs app container
	docker compose logs -f app

logs-db: ## Xem logs database
	docker compose logs -f db

# === STATUS & DEBUG ===

status: ## Kiểm tra trạng thái services
	docker compose ps

shell: ## Exec vào app container
	docker compose exec app bash

shell-db: ## Exec vào db container
	docker compose exec db bash

db-cli: ## Mở MariaDB CLI
	docker compose exec db mysql -u mtuser -p mt_db

check: ## Kiểm tra MT system requirements
	@echo "Opening MT Check in browser..."
	@open "http://localhost:$${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt-check.cgi" 2>/dev/null || \
		echo "http://localhost:$${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt-check.cgi"

# === BUILD & CLEANUP ===

build: ## Rebuild Docker image (không cache)
	docker compose build --no-cache

clean: ## Dừng services và xóa containers
	docker compose down --remove-orphans

destroy: ## Dừng và XÓA TẤT CẢ (bao gồm DB data)
	@echo "!!! WARNING: Sẽ xóa toàn bộ data (database, volumes) !!!"
	@read -p "Bạn chắc chắn? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v --remove-orphans

# === HELP ===

help: ## Hiển thị danh sách lệnh
	@echo "Movable Type 8.8.2 - Docker Development"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36mmake %-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
