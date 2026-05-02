#!/bin/bash
set -e

# Load environment variables (set by entrypoint.sh for cron context)
source /root/backup.env

TYPE="${1:-daily}"
DATE=$(date +%Y-%m-%d)
MONTH=$(date +%Y-%m)
BACKUP_DIR="/backups/${TYPE}"
MAX_DAILY=7
MAX_MONTHLY=12

DB_HOST="${POSTGRES_HOST:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-nexreel}"
DB_PASS="${POSTGRES_PASSWORD:-nexreel}"
DB_NAME="${POSTGRES_DB:-nexreel}"

mkdir -p "$BACKUP_DIR"

if [ "$TYPE" = "daily" ]; then
    FILENAME="nexreel_${DATE}.sql.gz"
    MAX=$MAX_DAILY
elif [ "$TYPE" = "monthly" ]; then
    FILENAME="nexreel_${MONTH}.sql.gz"
    MAX=$MAX_MONTHLY
else
    echo "[ERROR] Unknown backup type: ${TYPE}. Use 'daily' or 'monthly'."
    exit 1
fi

FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting ${TYPE} backup -> ${FILENAME}"

export PGPASSWORD="$DB_PASS"

if pg_dump \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --username "$DB_USER" \
    --dbname "$DB_NAME" \
    --clean \
    --if-exists \
    --single-transaction \
    --no-owner \
    --no-privileges \
    | gzip > "$FILEPATH"; then

    SIZE=$(du -h "$FILEPATH" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: ${FILENAME} (${SIZE})"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] Backup failed!"
    rm -f "$FILEPATH"
    exit 1
fi

unset PGPASSWORD

# Cleanup: keep only the most recent N backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX" ]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX))
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Removing ${REMOVE_COUNT} old ${TYPE} backup(s)..."
    ls -1 "$BACKUP_DIR"/*.sql.gz | sort | head -n "$REMOVE_COUNT" | xargs rm -f
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${TYPE} backup process finished. Current count: $(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)/${MAX}"
