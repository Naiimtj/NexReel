set shell := ["bash", "-cu"]

set dotenv-load := true

compose := "docker compose"

default:
    @just --list

# Instala dependencias de FastAPI en .venv del repo
install:
    cd fastapi && UV_PROJECT_ENVIRONMENT=../.venv uv sync --group dev

# Levanta PostgreSQL y el worker de backups para desarrollo local
up-local:
    #!/usr/bin/env bash
    set -euo pipefail
    {{compose}} up -d postgres backup
    for _ in {1..60}; do
        if docker exec nexreel-postgres psql -U ${POSTGRES_USER:-nexreel} -d ${POSTGRES_DB:-nexreel} -tAc "SELECT 1" >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    docker exec nexreel-postgres psql -U ${POSTGRES_USER:-nexreel} -d ${POSTGRES_DB:-nexreel} -tAc "SELECT 1" >/dev/null
    docker exec nexreel-postgres psql \
        -U ${POSTGRES_USER:-nexreel} \
        -d ${POSTGRES_DB:-nexreel} \
        -v ON_ERROR_STOP=1 \
        -c "ALTER USER \"${POSTGRES_USER:-nexreel}\" WITH PASSWORD '${POSTGRES_PASSWORD:-nexreel}';" >/dev/null

# Para el entorno local en contenedores
down-local:
    {{compose}} stop backup postgres
    {{compose}} rm -f backup postgres

# Reinicia PostgreSQL y backup en local
restart-local:
    {{compose}} restart postgres backup

# Muestra logs del entorno local
logs-local service="postgres":
    {{compose}} logs -f --tail=150 {{service}}

# Estado de los contenedores usados en desarrollo local
ps-local:
    {{compose}} ps postgres backup

# Abre una shell psql contra PostgreSQL del contenedor
db-shell:
    {{compose}} exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Ejecuta FastAPI en el host con recarga y sin contenedor
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    cd fastapi
    UV_PROJECT_ENVIRONMENT=../.venv uv sync --group dev --quiet
    ../.venv/bin/python debug.py

# Ejecuta Alembic contra la BD local
migrate:
    cd fastapi && ../.venv/bin/alembic upgrade head

# Ver estado de migraciones
migrate-status:
    cd fastapi && ../.venv/bin/alembic current

# Revierte la última migración
migrate-down:
    cd fastapi && ../.venv/bin/alembic downgrade -1

# Ver historial de migraciones
migrate-history:
    cd fastapi && ../.venv/bin/alembic history --verbose

# Crea una nueva migración con mensaje
migrate-new MESSAGE:
    cd fastapi && ../.venv/bin/alembic revision -m "{{MESSAGE}}"

# Ejecuta los tests pytest del backend
test *ARGS:
    cd fastapi && UV_PROJECT_ENVIRONMENT=../.venv uv sync --group dev --quiet
    cd fastapi && ../.venv/bin/python -m pytest tests/ -v {{ARGS}}

# Elimina entornos virtuales locales
venv-clean:
    rm -rf .venv fastapi/.venv

# Limpia el entorno local sin borrar datos de PostgreSQL
clean-local:
    {{compose}} stop backup postgres
    {{compose}} rm -f backup postgres

# Elimina todo lo necesario para una instalación limpia desde cero
[confirm("Esto eliminará contenedores, volúmenes, imágenes locales, backups y entornos virtuales del proyecto. ¿Continuar?")]
clean-all:
    #!/usr/bin/env bash
    set -euo pipefail
    {{compose}} down -v --remove-orphans --rmi local || true
    docker builder prune -f
    rm -rf .venv fastapi/.venv
    find . -type d \( -name __pycache__ -o -name .pytest_cache -o -name .mypy_cache \) -prune -exec rm -rf {} +
    find . -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete
    find database/backup_data -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true

# Limpia imágenes cacheadas del stack contenedorizado
docker-clean:
    {{compose}} down --rmi local
    docker builder prune -f

# Construye el stack contenedorizado completo
build:
    {{compose}} build postgres fastapi backup

# Levanta el stack completo en contenedores
up:
    {{compose}} up -d postgres fastapi backup

# Levanta y reconstruye todo el stack contenedorizado
up-all:
    {{compose}} up -d --build

# Para todos los contenedores del proyecto
down:
    {{compose}} down

# Reinicia el stack completo
restart:
    {{compose}} restart

# Estado de contenedores del stack completo
ps:
    {{compose}} ps

# Logs del stack completo
logs service="fastapi":
    {{compose}} logs -f --tail=150 {{service}}

# ──────────────────────── Despliegue en servidor Debian ────────────────────────
# Usa example-nginx/docker-compose.yml + example-nginx/.env
prod_compose := compose + " -f example-nginx/docker-compose.yml --env-file example-nginx/.env"

# Construye todas las imágenes del stack productivo (komga + nexreel + proxy)
prod-build:
    {{prod_compose}} build

# Levanta el stack productivo completo en segundo plano
prod-up:
    {{prod_compose}} up -d

# Apaga el stack productivo
prod-down:
    {{prod_compose}} down

# Reinicia solo los servicios de NexReel sin tocar Komga ni el proxy
prod-restart-nexreel:
    {{prod_compose}} restart nexreel-web nexreel-fastapi nexreel-postgres nexreel-backup

# Rebuild sin caché + recreate de web y fastapi (uso típico en el servidor tras `git pull`)
redeploy:
    cd /home/naiim/naiteca && {{compose}} build --no-cache nexreel-web nexreel-fastapi
    cd /home/naiim/naiteca && {{compose}} up -d --force-recreate nexreel-web nexreel-fastapi

# Reconstruye y redeploy del frontend NexReel tras cambios en `web/`
prod-refresh-web:
    {{prod_compose}} build nexreel-web
    {{prod_compose}} up -d nexreel-web

# Reconstruye y redeploy de la API NexReel tras cambios en `fastapi/`
prod-refresh-api:
    {{prod_compose}} build nexreel-fastapi
    {{prod_compose}} up -d nexreel-fastapi

# Logs de un servicio del stack productivo (por defecto: nexreel-fastapi)
prod-logs service="nexreel-fastapi":
    {{prod_compose}} logs -f --tail=150 {{service}}

# Estado de todos los contenedores del stack productivo
prod-ps:
    {{prod_compose}} ps