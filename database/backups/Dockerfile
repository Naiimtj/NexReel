FROM postgres:16-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        cron \
        bash \
    && rm -rf /var/lib/apt/lists/*

COPY backup.sh /usr/local/bin/backup.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/entrypoint.sh && \
    mkdir -p /backups/daily /backups/monthly

ENTRYPOINT ["entrypoint.sh"]
