"""Development entry point — run with: python debug.py"""

import subprocess
import sys

import uvicorn


def run_migrations() -> None:
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)


if __name__ == "__main__":
    run_migrations()
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=["api"])
