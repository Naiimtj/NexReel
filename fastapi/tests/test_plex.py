from __future__ import annotations

import asyncio

import httpx
import pytest

from api.core import plex_sync
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


def test_fetch_all_sections_raises_when_every_plex_section_fails(monkeypatch):
    async def fail_section(*_args, **_kwargs):
        request = httpx.Request("GET", "http://plex/library/sections/18/all")
        response = httpx.Response(401, request=request)
        raise httpx.HTTPStatusError("Unauthorized", request=request, response=response)

    monkeypatch.setattr(plex_sync, "_fetch_section", fail_section)

    async def fetch_sections():
        await plex_sync._fetch_all_sections("http://plex/library", "invalid-token")

    def run_fetch_sections():
        asyncio.run(fetch_sections())

    with pytest.raises(plex_sync.PlexSyncError, match="movie"):
        run_fetch_sections()

