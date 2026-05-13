from __future__ import annotations

from tests.conftest import register


def test_list_plex_returns_200(client):
    register(client, "plexlist")
    resp = client.get("/v1/plex")
    assert resp.status_code == 200


def test_list_plex_movies_returns_list(client):
    register(client, "plexmovies")
    resp = client.get("/v1/plex/movies")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_plex_tv_returns_list(client):
    register(client, "plextv")
    resp = client.get("/v1/plex/tv")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_plex_movies_search_returns_list(client):
    register(client, "plexsearch")
    resp = client.get("/v1/plex/movies?q=test")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_plex_sync_requires_admin_password(client):
    register(client, "plexsyncauth")
    resp = client.post("/v1/plex/sync")
    assert resp.status_code == 401
