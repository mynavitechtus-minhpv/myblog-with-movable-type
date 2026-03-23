# Movable Type 8.8.2 - Local Development Environment (Docker Compose)

## PHẦN 1: PostgreSQL có được hỗ trợ không?

### Kết luận: PostgreSQL KHÔNG được hỗ trợ chính thức trong Movable Type 8.x

Movable Type 8.8.2 (và toàn bộ dòng MT 8.x) **chỉ hỗ trợ chính thức**:
- **MySQL 5.7+**
- **MariaDB 10.x+**

PostgreSQL đã bị **loại bỏ khỏi danh sách supported databases** từ MT 7.x trở đi.
Source code MT 8.x không còn ship module `DBD::Pg` adapter và các schema SQL cho PostgreSQL.

### Phương án A — Thực tế, ổn định (KHUYẾN NGHỊ)

| Thành phần | Lựa chọn |
|---|---|
| CMS | Movable Type 8.8.2 |
| Database | **MariaDB 10.11** (official support) |
| Web Server | Apache httpd + mod_cgi |
| Container | Docker Compose |

→ **Đây là phương án được dùng trong repo này.**

### Phương án B — Giữ PostgreSQL (KHÔNG KHUYẾN NGHỊ)

- PostgreSQL **không có official support** trong MT 8.x
- Cần patch source code MT để thêm lại PostgreSQL adapter
- Schema SQL cần convert thủ công từ MySQL → PostgreSQL
- Không có đảm bảo về tính đúng đắn, migration, plugin compatibility
- **Đánh dấu rõ: đây là unsupported/custom hack, KHÔNG dùng cho production**

### Kết luận

**→ Dùng Phương án A (MariaDB) để develop local ổn định.**

---

## PHẦN 2: Kiến trúc

```
movabletype/
├── docker-compose.yml      # Orchestration
├── Dockerfile              # Custom image cho MT app
├── entrypoint.sh           # Startup script
├── mt-config.cgi           # MT configuration
├── .env                    # Environment variables
├── mt/                     # ← Đặt source code MT 8.8.2 vào đây
│   └── (giải nén MT-8.8.2.tar.gz vào folder này)
└── README.md               # File này
```

### Services

| Service | Image | Vai trò |
|---|---|---|
| `app` | Custom build (Dockerfile) | Apache + Perl + Movable Type |
| `db` | `mariadb:10.11` (official image) | MariaDB database |

### Modules Perl cần thiết (đã cài trong Dockerfile)

- `DBI` — Database interface
- `DBD::mysql` — MySQL/MariaDB driver (**bắt buộc**)
- `Image::Magick` — Xử lý ảnh
- `YAML::Syck`, `JSON`, `Archive::Zip`, `XML::Parser`, etc.

> **Lưu ý:** `DBD::Pg` (PostgreSQL driver) **KHÔNG cần cài** vì MT 8.x không hỗ trợ PostgreSQL.

---

## PHẦN 5: Hướng dẫn chạy

### Bước 0 — Chuẩn bị source code Movable Type

1. Download Movable Type 8.8.2 từ [movabletype.org](https://www.movabletype.org/) (cần license)
2. Giải nén vào folder `mt/`:

```bash
# Ví dụ:
tar xzf MT-8.8.2.tar.gz
mv MT-8.8.2/* mt/
```

Cấu trúc sau khi giải nén phải có:
```
mt/
├── mt.cgi
├── mt-check.cgi
├── mt-config.cgi-original
├── lib/
├── tmpl/
├── plugins/
├── ...
```

### Bước 1 — Build

```bash
docker compose build
```

### Bước 2 — Khởi chạy

```bash
docker compose up -d
```

### Bước 3 — Kiểm tra logs

```bash
# Tất cả services
docker compose logs -f

# Chỉ app
docker compose logs -f app

# Chỉ db
docker compose logs -f db
```

### Bước 4 — Truy cập

| URL | Mục đích |
|---|---|
| http://localhost:8080/cgi-bin/mt/mt.cgi | MT Admin (setup wizard lần đầu) |
| http://localhost:8080/cgi-bin/mt/mt-check.cgi | Kiểm tra system requirements |
| http://localhost:8080/ | Website frontend (sau khi publish) |

### Bước 5 — Exec vào container

```bash
# Vào app container
docker compose exec app bash

# Vào db container
docker compose exec db bash

# Truy cập MariaDB CLI
docker compose exec db mysql -u mtuser -pmtpassword mt_db
```

### Bước 6 — Dừng / Xóa

```bash
# Dừng
docker compose down

# Dừng và xóa volume (mất data DB)
docker compose down -v
```

---

## Cấu hình Database trong mt-config.cgi

File `mt-config.cgi` đã được cấu hình sẵn:

```perl
ObjectDriver DBI::mysql
Database mt_db
DBUser mtuser
DBPassword mtpassword
DBHost db
DBPort 3306
```

- `DBHost db` — tên service trong docker-compose (Docker internal DNS)
- Không cần thay đổi nếu dùng giá trị mặc định trong `.env`

---

## Chạy export từ MT Cloud (site khách) trên local

**Vì sao build source không có đủ page như web khách?**  
- Các trang trên web khách nằm trong **database** (entry, page, blog) và trong **file HTML đã publish** (static).  
- Export cloud thường chỉ có **static** (thư mục `20260316-010001/static`), **không có** dump database (.sql).  
- Nếu chạy MT local với DB trống → MT Admin không có bài/page của khách; nếu không dùng static export làm site root → trang chủ local cũng trống.

**Cách thấy đủ trang như web khách (chỉ xem, không chỉnh trong Admin):**

1. **Giữ** `docker-compose.override.yml` (đã có sẵn): nó mount `20260316-010001/static` làm site root.
2. Chạy: `make start` hoặc `docker compose up -d`.
3. Mở **http://localhost:8082/** (trang chủ) và các đường dẫn con (ví dụ `/news/`, `/member/`, …) — sẽ thấy **toàn bộ HTML đã publish** của khách (đủ page như trên web).

**Nếu đã xóa/đổi tên override:** tạo lại `docker-compose.override.yml` với nội dung:

```yaml
services:
  app:
    volumes:
      - ./20260316-010001/static:/var/www/html/site
```

Rồi `docker compose up -d` lại.

**MT Admin** (http://localhost:8082/cgi-bin/mt/mt.cgi) vẫn dùng DB local — không có entry/page của khách trừ khi khách cung cấp **dump MySQL** để restore vào MariaDB. Khi đó vừa xem đủ trang tĩnh (nhờ override), vừa có thể chỉnh nội dung trong Admin sau khi restore DB.

---

## Troubleshooting

### Lỗi "Can't connect to database"
- Chờ MariaDB khởi động xong (healthcheck): `docker compose logs db`
- Kiểm tra `.env` khớp với `mt-config.cgi`

### Lỗi permission trên mt/
```bash
chmod -R 755 mt/
chmod 755 mt/*.cgi
```

### Kiểm tra Perl modules
```bash
docker compose exec app perl -MDBI -e 'print "DBI OK\n"'
docker compose exec app perl -MDBD::mysql -e 'print "DBD::mysql OK\n"'
```

### Rebuild sau khi sửa Dockerfile
```bash
docker compose build --no-cache
docker compose up -d
```
