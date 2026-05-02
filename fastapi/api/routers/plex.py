from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.core.auth import get_current_user, require_admin_password
from api.core.nexreel.repository import (
    fetch_all,
    fetch_one,
    serialize_plex,
    serialize_plex_movie,
    serialize_plex_tv,
)
from api.core.plex_sync import sync_plex_data
from api.dependencies import get_db

router = APIRouter(
    prefix="/v1",
    tags=["Plex"],
)


class PlexSyncRequest(BaseModel):
    plex_url: str | None = None
    plex_api_key: str | None = None


@router.get("/plex", summary="Resumen de Plex", description="Devuelve la fila de resumen de `plex_data` con el total de películas, series y la última fecha de sincronización.")
def list_plex(_: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_one(db, "SELECT * FROM plex_data ORDER BY created_at ASC LIMIT 1", serializer=serialize_plex)


@router.get(
    "/plex/movies",
    summary="Listar películas de Plex",
    description="Devuelve todas las películas almacenadas en `plex_movie`, ordenadas alfabéticamente. Filtra por título o título original (búsqueda parcial, sin distinguir mayúsculas).",
)
def list_plex_movies(
    _: dict = Depends(get_current_user),
    q: str | None = Query(default=None, example="inception"),
    db: Session = Depends(get_db),
):
    if q:
        return fetch_all(
            db,
            "SELECT * FROM plex_movie WHERE title ILIKE :q OR original_title ILIKE :q ORDER BY title ASC",
            {"q": f"%{q}%"},
            serialize_plex_movie,
        )
    return fetch_all(db, "SELECT * FROM plex_movie ORDER BY title ASC", serializer=serialize_plex_movie)


@router.get(
    "/plex/tv",
    summary="Listar series de Plex",
    description="Devuelve todas las series almacenadas en `plex_tv`, ordenadas alfabéticamente. Filtra por título o título original (búsqueda parcial, sin distinguir mayúsculas).",
)
def list_plex_tv(
    _: dict = Depends(get_current_user),
    q: str | None = Query(default=None, example="breaking bad"),
    db: Session = Depends(get_db),
):
    if q:
        return fetch_all(
            db,
            "SELECT * FROM plex_tv WHERE title ILIKE :q OR original_title ILIKE :q ORDER BY title ASC",
            {"q": f"%{q}%"},
            serialize_plex_tv,
        )
    return fetch_all(db, "SELECT * FROM plex_tv ORDER BY title ASC", serializer=serialize_plex_tv)


@router.post(
    "/plex/sync",
    dependencies=[Depends(require_admin_password)],
    summary="Sincronizar biblioteca de Plex",
    description=(
        "Obtiene todo el contenido de las secciones configuradas en Plex y actualiza `plex_data`. "
        "Acepta opcionalmente `plex_url` y `plex_api_key` en el cuerpo de la petición para sobreescribir "
        "las variables de entorno del servidor en esta sincronización."
    ),
)
async def plex_sync(
    body: PlexSyncRequest = Body(default_factory=PlexSyncRequest),
    db: Session = Depends(get_db),
):
    try:
        return await sync_plex_data(db, plex_url=body.plex_url, plex_api_key=body.plex_api_key)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Plex sync failed: {exc}") from exc
