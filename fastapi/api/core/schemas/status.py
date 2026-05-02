from datetime import datetime

from pydantic import BaseModel


class StatusResponse(BaseModel):
    status: str
    timestamp: datetime


class BackupResponse(BaseModel):
    status: str
    message: str


class BackupListResponse(BaseModel):
    status: str
    backups: list[dict]
