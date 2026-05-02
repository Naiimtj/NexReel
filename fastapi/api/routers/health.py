from datetime import datetime, timezone

from fastapi import APIRouter

from api.core.schemas.status import StatusResponse

router = APIRouter(tags=["System"])


@router.get(
    "/health",
    response_model=StatusResponse,
    summary="Comprobación de estado",
    description="Comprueba que el servicio está en funcionamiento. Devuelve estado y timestamp.",
)
def health_check():
    return StatusResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc),
    )
