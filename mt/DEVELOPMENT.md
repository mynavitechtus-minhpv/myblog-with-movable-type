# Development Guide

Hướng dẫn triển khai Movable Type 8.8.2 từ đầu.

---

## 1. Yêu cầu

- Docker Desktop (macOS)
- Git
- Trình duyệt web

---

## 2. Chuẩn bị Source Code

### Bước 2.1: Tải Movable Type

1. Truy cập: https://www.movabletype.org/
2. Download **MT 8.8.2** (tar.gz)
3. Giải nén và copy vào thư mục `mt/`:

```bash
tar xzf MT-8.8.2.tar.gz
mv MT-8.8.2/* mt/
rm -rf MT-8.8.2 MT-8.8.2.tar.gz
```

### Bước 2.2: Cấp quyền

```bash
chmod -R 755 mt/
```

---

## 3. Khởi động Environment

### Bước 3.1: Build Docker Image

```bash
docker compose build
```

### Bước 3.2: Start Services

```bash
docker compose up -d
```

Chờ khoảng 10-20 giây để container khởi động hoàn tất.

### Bước 3.3: Kiểm tra trạng thái

```bash
docker compose ps
```

Kiểm tra logs nếu cần:
```bash
docker compose logs -f
```

---

## 4. Cài đặt Movable Type

### Bước 4.1: Truy cập MT Admin

Mở trình duyệt:
```
http://localhost:8082/cgi-bin/mt/mt.cgi
```

### Bước 4.2: Kiểm tra System Requirements (optional)

```
http://localhost:8082/cgi-bin/mt/mt-check.cgi
```

### Bước 4.3: Cấu hình Database

Trong quá trình cài đặt MT, sử dụng thông tin sau:

| Field | Value |
|-------|-------|
| Database Type | MySQL |
| Database Name | mt_db |
| Database User | mtuser |
| Database Password | mtpassword |
| Database Host | db |
| Database Port | 3306 |

### Bước 4.4: Hoàn tất cài đặt

Làm theo wizard của MT để tạo:
- Admin user
- Website/Blog đầu tiên

---

## 5. Common Commands

### Start/Stop

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart
```

### Logs

```bash
# All logs
docker compose logs -f

# App only
docker compose logs -f app

# Database only
docker compose logs -f db
```

### Shell Access

```bash
# Into app container
docker compose exec app bash

# Into database container
docker compose exec db bash
```

### Database CLI

```bash
docker compose exec db mysql -u mtuser -p mt_db
```

Password: `mtpassword`

### Rebuild Image (no cache)

```bash
docker compose build --no-cache
```

### Clean Up

```bash
# Stop and remove containers (keep images)
docker compose down

# Remove volumes (wipe database)
docker compose down -v

# Full cleanup (remove images too)
docker compose down --rmi all -v
```

---

## 6. Cấu trúc Project

```
movabletype/
├── docker-compose.yml     # Container orchestration
├── Dockerfile              # Custom Perl/Apache image
├── entrypoint.sh          # Startup script
├── Makefile               # Convenience commands
├── .env                   # Environment variables
├── mt-config.cgi          # MT application config
├── mt/                    # MT source code (gitignored)
│   └── ...
└── published/             # Static exports (gitignored)
```

---

## 7. URLs

| URL | Mục đích |
|-----|----------|
| http://localhost:8082/cgi-bin/mt/mt.cgi | MT Admin |
| http://localhost:8082/cgi-bin/mt/mt-check.cgi | System check |
| http://localhost:8082/ | Published site |

---

## 8. Database

| Property | Value |
|----------|-------|
| Driver | DBD::MariaDB (MySQL-compatible) |
| Database | mt_db |
| User | mtuser |
| Host | db |
| Port | 3306 |

---

## 9. Troubleshooting

### Container không start được

```bash
# Xem logs
docker compose logs app
```

### Database connection fails

Kiểm tra database đã healthy chưa:
```bash
docker compose ps
```

### Permission issues

```bash
docker compose exec app chown -R www-data:www-data /var/www/cgi-bin/mt
```

### Xóa database và bắt đầu lại

```bash
docker compose down -v
# Sau đó chạy lại: docker compose up -d
```

---

## 10. Environment Variables

Các biến trong `.env`:

```bash
# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=mt_db
MYSQL_USER=mtuser
MYSQL_PASSWORD=mtpassword

# MT
MT_HTTP_PORT=8082
MT_CGI_PATH=/cgi-bin/mt/
MT_STATIC_WEB_PATH=/mt-static/
```

---

## 11. Disable Background Tasks

Trong `mt-config.cgi`:
```
LaunchBackgroundTasks 0
```

Điều này tắt background tasks, hữu ích cho local development.

---

## 12. Troubleshooting thường gặp

### Lỗi: "Can't connect to MySQL server"

- Kiểm tra DB container đang chạy: `docker compose ps`
- Kiểm tra logs: `docker compose logs db`

### Lỗi: "Permission denied" khi upload

```bash
docker compose exec app chmod -R 755 /var/www/cgi-bin/mt/mt-static
```

### Lỗi: Image driver không hoạt động

Đảm bảo `ImageDriver Imager` trong mt-config.cgi (đã có sẵn).

---

## Quick Reference (Makefile)

```bash
make start      # Start services
make stop       # Stop services
make restart    # Restart
make logs       # View all logs
make logs-app   # App logs
make logs-db    # Database logs
make status     # Check status
make shell      # Shell into app
make shell-db   # Shell into db
make db-cli     # MariaDB CLI
make build      # Rebuild image (no cache)
make clean      # Remove containers
make destroy    # Remove everything including DB
make help       # Show help
```