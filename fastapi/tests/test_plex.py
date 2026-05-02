from __future__ import annotations

from tests.conftest import register


def test_create_plex_returns_record(client):
    register(client, "plexcreate")
    resp = client.post("/v1/plex")
    assert resp.status_code == 200
    body = resp.json()
    assert "movie" in body
    assert "tv" in body


def test_create_plex_idempotent(client):
    register(client, "plexidem")
    first = client.post("/v1/plex").json()
    second = client.post("/v1/plex").json()
    assert first["id"] == second["id"]


def test_list_plex(client):
    register(client, "plexlist")
    client.post("/v1/plex")
    resp = client.get("/v1/plex")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1
