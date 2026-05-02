import logging
import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from api.config.env import settings
from api.routers.backup import router as router_backup
from api.routers.health import router as router_health
from api.routers.users import router as router_users
from api.routers.playlists import router as router_playlists
from api.routers.forums import router as router_forums
from api.routers.messages import router as router_messages
from api.routers.medias import router as router_medias
from api.routers.tv import router as router_tv
from api.routers.plex import router as router_plex

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexreel-fastapi")


async def _scheduled_plex_sync() -> None:
    """Daily Plex library sync — mirrors the old-api cron at 04:00."""
    from api.core.plex_sync import sync_plex_data
    from api.dependencies import get_db

    db = next(get_db())
    try:
        await sync_plex_data(db)
    except Exception as exc:
        logger.error("Scheduled Plex sync failed: %s", exc)
    finally:
        db.close()


def _seed_admin_user() -> None:
    """Insert the bootstrap admin user from .env if it does not already exist."""
    if not settings.ADMIN_EMAIL or not settings.ADMIN_USER or not settings.ADMIN_PASSWORD:
        logger.info("Admin seed skipped: ADMIN_EMAIL, ADMIN_USER or ADMIN_PASSWORD not set.")
        return

    from api.core.auth import ADMIN_ROLE, hash_password
    from api.dependencies import get_db
    from sqlalchemy import text

    db = next(get_db())
    try:
        db.execute(
            text(
                """
                INSERT INTO users (email, username, password, region, role, avatar_url, is_plex_friendly)
                VALUES (:email, :username, :password, :region, :role, :avatar_url, :is_plex_friendly)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "email": settings.ADMIN_EMAIL.lower(),
                "username": settings.ADMIN_USER.lower(),
                "password": hash_password(settings.ADMIN_PASSWORD),
                "region": "ES",
                "role": ADMIN_ROLE,
                "avatar_url": "https://res.cloudinary.com/dznwlaen6/image/upload/v1703234529/nexreel/ekto0wthkx2fi0hric8y.jpg",
                "is_plex_friendly": True,
            },
        )
        db.commit()
        logger.info("Admin user '%s' seeded (or already exists).", settings.ADMIN_USER)
    except Exception as exc:
        logger.error("Admin seed failed: %s", exc)
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Running Alembic migrations...")
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        logger.info("Migrations completed successfully.")
        if result.stdout.strip():
            logger.info(result.stdout.strip())
        _seed_admin_user()
    else:
        logger.error("Migration failed!")
        logger.error(result.stdout.strip())
        logger.error(result.stderr.strip())

    scheduler = AsyncIOScheduler(timezone=settings.TZ)
    scheduler.add_job(
        _scheduled_plex_sync,
        CronTrigger(hour=4, minute=0),
        id="plex_sync_daily",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Plex sync scheduler started (daily at 04:00 %s).", settings.TZ)

    yield

    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped.")


app = FastAPI(
    title="NexReel API",
    description="Backend FastAPI para NexReel sobre PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url="/redoc",
    swagger_ui_parameters={
        "operationsSorter": "method",
        "defaultModelsExpandDepth": -1,
    },
)

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

_SWAGGER_HTML = (Path(__file__).parent / "static" / "swagger.html").read_text()


@app.get("/", include_in_schema=False)
async def custom_swagger_ui_html():
    html = _SWAGGER_HTML.replace("{{root}}", app.root_path)
    return HTMLResponse(html)


app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET, same_site="lax")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")
    return JSONResponse(
        status_code=422,
        content={"status": "error", "detail": errors},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "detail": str(exc)},
    )


app.include_router(router_health)
app.include_router(router_backup)
app.include_router(router_users)
app.include_router(router_playlists)
app.include_router(router_forums)
app.include_router(router_messages)
app.include_router(router_medias)
app.include_router(router_tv)
app.include_router(router_plex)


def _custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema.setdefault("components", {})["securitySchemes"] = {
        "X-User-Token": {
            "type": "apiKey",
            "in": "header",
            "name": "X-User-Token",
            "description": "Token personal de usuario. Obtenerlo con `POST /v1/users/me/token` tras hacer login.",
        },
        "X-Admin-Password": {
            "type": "apiKey",
            "in": "header",
            "name": "X-Admin-Password",
            "description": "Contraseña de admin requerida para los endpoints `/db/*` (backup/restore).",
        },
    }
    # FastAPI auto-names the APIKeyHeader scheme "APIKeyHeader"; remap to our
    # friendly names so Swagger UI applies the correct token when authorized.
    # Backup routes (/db/*) require X-Admin-Password; all other routes use X-User-Token.
    for path, path_item in schema.get("paths", {}).items():
        for operation in path_item.values():
            if not isinstance(operation, dict):
                continue
            security = operation.get("security")
            if not security:
                continue
            target_scheme = "X-Admin-Password" if path.startswith("/db/") or path.startswith("/v1/plex") else "X-User-Token"
            operation["security"] = [
                {target_scheme: []} if "APIKeyHeader" in req else req
                for req in security
            ]
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = _custom_openapi
