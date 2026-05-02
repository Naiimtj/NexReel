#!/bin/sh
set -eu

.venv/bin/alembic upgrade head
exec .venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000