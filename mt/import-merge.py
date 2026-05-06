#!/usr/bin/env python3
"""
import-merge.py — Merge SQL dump an toàn.
- Bỏ DROP TABLE / CREATE TABLE / TRUNCATE (không xóa bảng hiện tại)
- Chuyển INSERT INTO → INSERT IGNORE INTO (bỏ qua dòng trùng PK)
- Pipe toàn bộ file đã lọc vào mysql --force (không bỏ sót statement nào)

Usage:
    python3 import-merge.py <dump-file.sql>
    python3 import-merge.py <dump-file.sql> --dry-run
"""

import re
import sys
import subprocess
from pathlib import Path

SCRIPT_DIR   = Path(__file__).parent
ENV_FILE     = SCRIPT_DIR / ".env"
COMPOSE_FILE = SCRIPT_DIR / "docker-compose.yml"


def load_env(env_path: Path) -> dict:
    env = {}
    if not env_path.exists():
        return env
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def filter_dump(sql_text: str) -> str:
    """
    Lọc dump:
    1. Bỏ toàn bộ CREATE TABLE ... ; (block nhiều dòng)
    2. Bỏ DROP TABLE / TRUNCATE TABLE (1 dòng)
    3. Bỏ LOCK TABLES / UNLOCK TABLES
    4. Chuyển INSERT INTO → INSERT IGNORE INTO
    5. Giữ nguyên tất cả SET/ALTER/comment/v.v.
    """
    lines = sql_text.splitlines(keepends=True)
    output = []
    skip_block = False  # đang trong CREATE TABLE block

    skip_line_re = re.compile(
        r"^\s*(DROP\s+TABLE|TRUNCATE\s+TABLE|LOCK\s+TABLES|UNLOCK\s+TABLES)",
        re.IGNORECASE,
    )
    create_start_re = re.compile(r"^\s*CREATE\s+TABLE\b", re.IGNORECASE)
    # Kết thúc CREATE TABLE block: dòng chứa "); " hoặc ");"
    create_end_re   = re.compile(r"^\)\s*(ENGINE|DEFAULT\s+CHARSET|ROW_FORMAT|[A-Z]|;)", re.IGNORECASE)
    insert_re       = re.compile(r"^(INSERT\s+)(INTO\s+)", re.IGNORECASE)

    for line in lines:
        stripped = line.strip()

        # Đang trong CREATE TABLE block → skip cho đến hết block
        if skip_block:
            if create_end_re.match(stripped) or stripped == ");":
                skip_block = False
            continue

        # Bắt đầu CREATE TABLE block
        if create_start_re.match(stripped):
            skip_block = True
            continue

        # Bỏ DROP TABLE / TRUNCATE / LOCK / UNLOCK (1 dòng)
        if skip_line_re.match(stripped):
            continue

        # Chuyển INSERT INTO → INSERT IGNORE INTO
        line = insert_re.sub(r"\1IGNORE \2", line)

        output.append(line)

    return "".join(output)


def count_inserts(text: str) -> int:
    return sum(1 for l in text.splitlines() if re.match(r"^\s*INSERT\s+IGNORE\s+INTO", l, re.IGNORECASE))


def run_filtered_dump(filtered_sql: str, env: dict) -> bool:
    """Pipe toàn bộ filtered SQL vào mysql --force qua stdin."""
    cmd = [
        "docker", "compose", "-f", str(COMPOSE_FILE),
        "exec", "-T", "db",
        "mysql",
        f"-u{env['MYSQL_USER']}",
        f"-p{env['MYSQL_PASSWORD']}",
        env["MYSQL_DATABASE"],
        "--force",           # tiếp tục dù có lỗi
        "--show-warnings",   # hiện warning (duplicate key v.v.)
    ]
    result = subprocess.run(
        cmd,
        input=filtered_sql,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )

    # Lọc output: chỉ hiện lỗi thật, bỏ warning "Duplicate entry"
    stderr = result.stderr or ""
    for line in stderr.splitlines():
        if not line.strip():
            continue
        if "Duplicate entry" in line or "duplicate" in line.lower():
            continue  # trùng khóa là bình thường, không hiện
        print(f"  WARN/ERR: {line}")

    return result.returncode == 0


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    sql_file = Path(args[0])
    dry_run  = "--dry-run" in args

    if not sql_file.exists():
        print(f"[ERROR] File không tồn tại: {sql_file}")
        sys.exit(1)

    env = load_env(ENV_FILE)
    for key in ("MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"):
        if key not in env:
            print(f"[ERROR] Thiếu biến {key} trong .env")
            sys.exit(1)

    print(f"==> File     : {sql_file}")
    print(f"==> Database : {env['MYSQL_DATABASE']}")
    print(f"==> Dry-run  : {'YES' if dry_run else 'NO'}")
    print()

    print("==> Đang đọc và lọc dump...", flush=True)
    raw      = sql_file.read_text(encoding="utf-8", errors="replace")
    filtered = filter_dump(raw)

    original_lines  = raw.count("\n")
    filtered_lines  = filtered.count("\n")
    insert_count    = count_inserts(filtered)
    removed_lines   = original_lines - filtered_lines

    print(f"    Dòng gốc         : {original_lines:,}")
    print(f"    Dòng sau lọc     : {filtered_lines:,}  (bỏ {removed_lines:,} dòng DROP/CREATE/TRUNCATE)")
    print(f"    INSERT IGNORE    : {insert_count} statement(s)")
    print()

    if dry_run:
        preview_path = sql_file.with_suffix(".filtered-preview.sql")
        preview_path.write_text(filtered, encoding="utf-8")
        print(f"==> Dry-run: đã lưu file đã lọc để xem trước:")
        print(f"    {preview_path}")
        print()
        print("==> Kiểm tra file preview, nếu ổn thì chạy lại không có --dry-run")
        return

    print("==> Đang import...", flush=True)
    ok = run_filtered_dump(filtered, env)

    print()
    if ok:
        print("==> Import hoàn tất.")
    else:
        print("==> Import xong nhưng có một số lỗi (xem WARN/ERR ở trên).")
    print()
    u = env["MYSQL_USER"]
    p = env["MYSQL_PASSWORD"]
    d = env["MYSQL_DATABASE"]
    print("==> Kiểm tra số record sau import:")
    print(f"    docker compose exec db sh -lc 'mysql -u\"{u}\" -p\"{p}\" \"{d}\" -e \"SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema=database() ORDER BY table_rows DESC LIMIT 20;\"'")


if __name__ == "__main__":
    main()
