from __future__ import annotations

from tests.conftest import login, logout, register, unique


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_forum(client, title: str | None = None) -> dict:
    t = title or unique("forum")
    resp = client.post("/v1/forums", data={
        "title": t,
        "shortDescription": "short",
        "description": "desc",
        "tags": '["smoke"]',
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


def _create_movie(client) -> dict:
    mid = unique("mov")
    resp = client.post("/v1/medias/movie", json={"mediaId": mid, "media_type": "movie", "runtime": 100, "seen": True, "pending": False})
    assert resp.status_code == 200
    return resp.json()


# ---------------------------------------------------------------------------
# Forum CRUD
# ---------------------------------------------------------------------------

def test_create_forum(client):
    register(client, "fcreate")
    f = _create_forum(client)
    assert "id" in f
    assert "title" in f


def test_list_forums(client):
    register(client, "flist")
    _create_forum(client)
    resp = client.get("/v1/forums")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_forum_detail(client):
    register(client, "fdetail")
    f = _create_forum(client)
    resp = client.get(f"/v1/forums/{f['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == f["id"]
    assert "followers" in resp.json()
    assert "userCreate" in resp.json()


def test_forum_detail_not_found_returns_404(client):
    register(client, "fnotfound")
    resp = client.get("/v1/forums/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_forum_update(client):
    register(client, "fupdate")
    f = _create_forum(client)
    resp = client.patch(f"/v1/forums/{f['id']}", data={"title": "Updated Forum"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Forum"


def test_forum_update_forbidden_for_non_owner(client):
    a = register(client, "fforbida")
    f = _create_forum(client)
    logout(client)
    b = register(client, "fforbidb")
    resp = client.patch(f"/v1/forums/{f['id']}", data={"title": "Hacked"})
    assert resp.status_code == 403


def test_forum_delete(client):
    register(client, "fdelete")
    f = _create_forum(client)
    resp = client.delete(f"/v1/forums/{f['id']}")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
    assert client.get(f"/v1/forums/{f['id']}").status_code == 404


# ---------------------------------------------------------------------------
# Forum media
# ---------------------------------------------------------------------------

def test_forum_add_and_remove_media(client):
    register(client, "fmedia")
    f = _create_forum(client)
    movie = _create_movie(client)
    resp = client.post(f"/v1/forums/{f['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    assert resp.status_code == 200
    medias = resp.json()["medias"]
    assert any(m["mediaId"] == movie["mediaId"] for m in medias)

    resp = client.request("DELETE", f"/v1/forums/{f['id']}/media", json={"mediaIdDelete": movie["mediaId"]})
    assert resp.status_code == 200
    assert not any(m["mediaId"] == movie["mediaId"] for m in resp.json()["medias"])


def test_forum_add_duplicate_media_returns_404(client):
    register(client, "fmediadupe")
    f = _create_forum(client)
    movie = _create_movie(client)
    client.post(f"/v1/forums/{f['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    resp = client.post(f"/v1/forums/{f['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Forum follow / like / unfollow
# ---------------------------------------------------------------------------

def _two_users_with_forum(client):
    a = register(client, "ffolla")
    f = _create_forum(client)
    logout(client)
    b = register(client, "ffollb")
    return a, b, f


def test_forum_follow(client):
    a, b, f = _two_users_with_forum(client)
    resp = client.post(f"/v1/forums/{f['id']}/follow")
    assert resp.status_code == 200
    assert resp.json()["userId"] == b["id"]


def test_forum_follow_own_returns_404(client):
    register(client, "ownff")
    f = _create_forum(client)
    resp = client.post(f"/v1/forums/{f['id']}/follow")
    assert resp.status_code == 404


def test_forum_follow_duplicate_returns_404(client):
    a, b, f = _two_users_with_forum(client)
    client.post(f"/v1/forums/{f['id']}/follow")
    resp = client.post(f"/v1/forums/{f['id']}/follow")
    assert resp.status_code == 404


def test_forum_like(client):
    a, b, f = _two_users_with_forum(client)
    client.post(f"/v1/forums/{f['id']}/follow")
    resp = client.patch(f"/v1/forums/{f['id']}/follow", json={"like": True})
    assert resp.status_code == 200
    assert resp.json()["like"] is True


def test_forum_unfollow(client):
    a, b, f = _two_users_with_forum(client)
    client.post(f"/v1/forums/{f['id']}/follow")
    resp = client.delete(f"/v1/forums/{f['id']}/follow")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
