import gzip
import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path

from api.config.env import settings

logger = logging.getLogger("nexreel-fastapi")

BACKUP_DATA_DIR = Path(settings.BACKUP_DATA_DIR)

# Container name used when FastAPI runs on the host (just dev) and needs to
# delegate pg_dump/psql to the Postgres container to avoid client/server
# version mismatches.
_LOCAL_POSTGRES_CONTAINER = "nexreel-postgres"


def _is_host_mode() -> bool:
    """Return True when FastAPI is running on the host (not inside Docker).

    Detected by POSTGRES_HOST pointing to the loopback address, which is
    only set when using just dev against the local Docker Postgres container.
    """
    return settings.POSTGRES_HOST in ("127.0.0.1", "localhost")


def _pg_env() -> dict[str, str]:
    """Environment variables for pg_dump/psql commands."""
    return {
        "PGHOST": settings.POSTGRES_HOST,
        "PGPORT": str(settings.POSTGRES_PORT),
        "PGUSER": settings.POSTGRES_USER,
        "PGPASSWORD": settings.POSTGRES_PASSWORD,
        "PGDATABASE": settings.POSTGRES_DB,
    }


def _docker_exec_pg_cmd(pg_cmd: list[str]) -> tuple[list[str], dict[str, str]]:
    """Wrap a pg_dump/psql command in docker exec so it runs inside the
    Postgres container, avoiding client/server version mismatches when
    FastAPI is running on the host.
    """
    cmd = [
        "docker", "exec",
        "-e", f"PGPASSWORD={settings.POSTGRES_PASSWORD}",
        _LOCAL_POSTGRES_CONTAINER,
    ] + pg_cmd + [
        "-h", "localhost",
        "-U", settings.POSTGRES_USER,
        "-d", settings.POSTGRES_DB,
        "-p", str(settings.POSTGRES_PORT),
    ]
    return cmd, {**os.environ}


def _run_sql_import(sql_content: bytes) -> dict:
    """Execute raw SQL content via the psql CLI client."""
    sanitized_sql = b"\n".join(
        line
        for line in sql_content.splitlines()
        if not line.strip().startswith(b"SET transaction_timeout =")
    )

    if _is_host_mode():
        cmd, env = _docker_exec_pg_cmd(
            ["psql", "--single-transaction", "--set", "ON_ERROR_STOP=1"]
        )
    else:
        cmd = ["psql", "--single-transaction", "--set", "ON_ERROR_STOP=1"]
        env = {**os.environ, **_pg_env()}

    result = subprocess.run(cmd, input=sanitized_sql, capture_output=True, env=env)

    if result.returncode != 0:
        stderr = result.stderr.decode().strip()
        return {"status": "error", "message": stderr}

    return {"status": "ok", "message": "SQL dump imported successfully"}


def import_sql_dump(sql_content: bytes) -> dict:
    """Import an external PostgreSQL SQL dump."""
    return _run_sql_import(sql_content)


def create_backup() -> dict:
    """Create a manual gzipped backup using pg_dump."""
    manual_dir = BACKUP_DATA_DIR / "manual"
    manual_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filename = f"nexreel_{timestamp}.sql.gz"
    filepath = manual_dir / filename

    if _is_host_mode():
        cmd, env = _docker_exec_pg_cmd(
            ["pg_dump", "--clean", "--if-exists", "--no-owner", "--no-privileges"]
        )
    else:
        cmd = ["pg_dump", "--clean", "--if-exists", "--no-owner", "--no-privileges"]
        env = {**os.environ, **_pg_env()}

    result = subprocess.run(cmd, capture_output=True, env=env)

    if result.returncode != 0 or not result.stdout:
        stderr = result.stderr.decode().strip()
        return {
            "status": "error",
            "message": stderr or "pg_dump produced no output",
            "file": None,
        }

    with gzip.open(filepath, "wb") as f:
        f.write(result.stdout)

    size_mb = filepath.stat().st_size / (1024 * 1024)

    return {
        "status": "ok",
        "message": f"Backup created: {filename} ({size_mb:.2f} MB)",
        "file": filename,
    }


def list_backups() -> list[dict]:
    """List all available backup files under backup_data/."""
    backups = []
    if not BACKUP_DATA_DIR.exists():
        return backups

    for path in sorted(BACKUP_DATA_DIR.rglob("*.sql.gz")):
        rel_path = path.relative_to(BACKUP_DATA_DIR)
        size_mb = path.stat().st_size / (1024 * 1024)
        modified = datetime.fromtimestamp(path.stat().st_mtime)
        backups.append(
            {
                "file": str(rel_path),
                "size_mb": round(size_mb, 2),
                "modified": modified.isoformat(),
                "type": rel_path.parts[0] if len(rel_path.parts) > 1 else "root",
            }
        )

    return backups


def restore_backup(file_path: str) -> dict:
    """Restore a gzipped backup from backup_data/ by its relative path."""
    target = (BACKUP_DATA_DIR / file_path).resolve()

    # Ensure the resolved path is inside BACKUP_DATA_DIR (path traversal protection)
    if not str(target).startswith(str(BACKUP_DATA_DIR.resolve())):
        return {"status": "error", "message": "Invalid file path"}

    if not target.exists():
        return {"status": "error", "message": f"Backup not found: {file_path}"}

    with gzip.open(target, "rb") as f:
        sql_content = f.read()

    return _run_sql_import(sql_content)
