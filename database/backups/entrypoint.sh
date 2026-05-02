#!/bin/bash
set -e

# Export environment variables for cron jobs (values must be shell-quoted
# because passwords may contain metacharacters like ) * $ ! etc.)
env | grep -E '^(POSTGRES_|DATABASE_URL=|BACKUP_|TZ=)' | while IFS='=' read -r key value; do
    printf "%s=%q\n" "$key" "$value"
done > /root/backup.env

# Create cron schedule:
#   Daily backup at midnight
#   Monthly backup at 00:30 on the 1st of each month
cat > /etc/cron.d/backup-cron << 'CRON'
0 0 * * * root /usr/local/bin/backup.sh daily >> /var/log/backup.log 2>&1
30 0 1 * * root /usr/local/bin/backup.sh monthly >> /var/log/backup.log 2>&1
CRON

chmod 0644 /etc/cron.d/backup-cron

# Create log file
touch /var/log/backup.log

echo "Backup container started. Schedule:"
echo "  - Daily at 00:00 (keep 7)"
echo "  - Monthly on 1st at 00:30 (keep 12)"
echo "Timezone: ${TZ:-Europe/Madrid}"

# Run cron in foreground, tailing log for container output
cron && tail -f /var/log/backup.log
