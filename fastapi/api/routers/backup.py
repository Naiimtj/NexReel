from fastapi import APIRouter, Depends, HTTPException, UploadFile

from api.core.auth import require_admin_password
from api.core.database.backup import create_backup, import_sql_dump, list_backups, restore_backup
from api.core.schemas.status import BackupListResponse, BackupResponse

router = APIRouter(
    prefix="/db",
    tags=["Backup"],
    dependencies=[Depends(require_admin_password)],
)


@router.post(
    "/backup",
    response_model=BackupResponse,
    summary="Crear un backup manual de la base de datos",
    description="Genera un volcado completo de la base de datos PostgreSQL (pg_dump) "
    "y lo guarda comprimido (.sql.gz) en el directorio de backups manuales.",
)
def backup_database():
    result = create_backup()
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return BackupResponse(**result)


@router.get(
    "/backup/list",
    response_model=BackupListResponse,
    summary="Listar todos los backups disponibles",
    description="Devuelve la lista de todos los archivos de backup disponibles "
    "(diarios, mensuales y manuales) con su ruta, tamaño y fecha.",
)
def backup_list():
    backups = list_backups()
    return BackupListResponse(status="ok", backups=backups)


@router.post(
    "/backup/restore",
    response_model=BackupResponse,
    summary="Restaurar un backup a partir de su ruta (de /db/backup/list)",
    description="Restaura la base de datos desde un archivo de backup existente. "
    "Usa la ruta devuelta por /db/backup/list. Sobreescribe los datos actuales.",
)
def backup_restore(file: str):
    result = restore_backup(file)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return BackupResponse(**result)


@router.post(
    "/import",
    response_model=BackupResponse,
    summary="Importar un archivo SQL a la base de datos",
    description="Importa un archivo .sql externo ejecutándolo con psql sobre la base PostgreSQL actual.",
)
def import_database(file: UploadFile):
    if not file.filename or not file.filename.endswith(".sql"):
        raise HTTPException(status_code=400, detail="Only .sql files are accepted")
    sql_content = file.file.read()
    if not sql_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    result = import_sql_dump(sql_content)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return BackupResponse(**result)
