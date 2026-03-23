# CLAUDE.md

Hướng dẫn làm việc với project Movable Type 8.8.2 trên Docker.

## Cấu trúc Project

```
mt/
├── docker-compose.yml     # Container orchestration (app + db)
├── Dockerfile             # Custom Perl/Apache image
├── entrypoint.sh          # Startup script
├── Makefile               # Convenience commands
├── .env                   # Environment variables
├── .env.example           # Environment template
├── mt-config.cgi          # MT application config
├── CLAUDE.md              # File này
├── DEVELOPMENT.md         # Hướng dẫn triển khai chi tiết
├── README.md              # Project README
└── [MT source files]     # mt.cgi, mt-static/, plugins/, v.v.
```

## Common Commands

```bash
# Build & Start
docker compose build
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Shell vào container
docker compose exec app bash

# Database CLI
docker compose exec db mysql -u mtuser -p mt_db
# Password: mtpassword
```

## URLs

| URL | Mục đích |
|-----|----------|
| http://localhost:8082/cgi-bin/mt/mt.cgi | MT Admin |
| http://localhost:8082/cgi-bin/mt/mt-check.cgi | System check |

## Database

- Database: `mt_db`
- User: `mtuser`
- Password: `mtpassword`
- Host: `db` (Docker internal)

## Development Notes

- Thư mục `mt/` được mount trực tiếp vào container - thay đổi phản ánh ngay lập tức
- Database chờ MariaDB healthy trước khi start Apache
- Background tasks tắt (`LaunchBackgroundTasks 0`) cho local dev
- Image driver: `Imager`

Xem `DEVELOPMENT.md` để biết hướng dẫn chi tiết.