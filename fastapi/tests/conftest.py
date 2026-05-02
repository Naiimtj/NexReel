from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from api.config.env import settings
from api.dependencies import get_db
from api.main import app

# ---------------------------------------------------------------------------
# DB session scoped to each test — rolls back automatically
# ---------------------------------------------------------------------------

engine = create_engine(settings.sqlalchemy_database_url)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def unique(prefix: str) -> str:
    return f"{prefix}_{int(time.time() * 1000)}"


def register(client, prefix: str = "user", password: str = "Test1234!") -> dict:
    u = unique(prefix)
    resp = client.post(
        "/v1/register",
        data={"email": f"{u}@test.com", "username": u, "password": password, "region": "ES"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


def login(client, email: str, password: str = "Test1234!") -> dict:
    resp = client.post("/v1/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()


def logout(client) -> None:
    client.post("/v1/logout")
