#!/bin/bash
set -e

echo "=== Movable Type 8.8.2 Local Dev ==="

# Kiểm tra MT source code có tồn tại không
if [ ! -f /var/www/cgi-bin/mt/mt.cgi ]; then
    echo ""
    echo "!!! ERROR: Movable Type source code not found !!!"
    echo ""
    echo "Bạn cần download MT 8.8.2 và giải nén vào folder ./mt/"
    echo "Cấu trúc cần có:"
    echo "  mt/mt.cgi"
    echo "  mt/mt-check.cgi"
    echo "  mt/lib/"
    echo "  mt/mt-static/"
    echo ""
    echo "Container sẽ dừng lại."
    exit 1
fi

# Clean stale Apache state
rm -rf /var/run/apache2/* 2>/dev/null || true

# Set permissions
chmod 755 /var/www/cgi-bin/mt/*.cgi 2>/dev/null || true
chown -R www-data:www-data /var/www/cgi-bin/mt/ 2>/dev/null || true
mkdir -p /var/www/html/site
chown -R www-data:www-data /var/www/html/site /var/www/html/mt-static /var/www/html
chmod -R 755 /var/www/html

# Đợi database sẵn sàng
echo "Waiting for database..."
MAX_TRIES=30
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if perl -MDBI -MDBD::MariaDB -e "DBI->connect('dbi:MariaDB:host=${MT_DB_HOST};port=${MT_DB_PORT};database=${MT_DB_NAME}', '${MT_DB_USER}', '${MT_DB_PASS}')" 2>/dev/null; then
        echo "Database is ready!"
        break
    fi
    COUNT=$((COUNT + 1))
    echo "  Waiting for database... ($COUNT/$MAX_TRIES)"
    sleep 2
done

if [ $COUNT -eq $MAX_TRIES ]; then
    echo "WARNING: Could not connect to database after $MAX_TRIES attempts."
    echo "Starting Apache anyway - MT will show database error."
fi

echo ""
echo "=== Starting Apache ==="
echo "MT Admin:  http://localhost:${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt.cgi"
echo "MT Check:  http://localhost:${MT_HTTP_PORT:-8080}/cgi-bin/mt/mt-check.cgi"
echo ""

# Start Apache in foreground
exec apachectl -D FOREGROUND
