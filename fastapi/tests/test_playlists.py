from __future__ import annotations

from tests.conftest import login, logout, register, unique


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_playlist(client, title: str | None = None) -> dict:
    t = title or unique("playlist")
    resp = client.post("/v1/playlists", data={"title": t, "description": "desc", "tags": '["smoke"]'})
    assert resp.status_code == 200, resp.text
    return resp.json()


def _create_movie(client) -> dict:
    mid = unique("mov")
    resp = client.post("/v1/medias/movie", json={"mediaId": mid, "media_type": "movie", "runtime": 100, "seen": True, "pending": False})
    assert resp.status_code == 200
    return resp.json()


# ---------------------------------------------------------------------------
# Playlist CRUD
# ---------------------------------------------------------------------------

def test_create_playlist(client):
    register(client, "plcreate")
    pl = _create_playlist(client)
    assert "id" in pl
    assert "title" in pl


def test_list_playlists(client):
    register(client, "pllist")
    _create_playlist(client)
    resp = client.get("/v1/playlists")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_playlists_me(client):
    register(client, "plme")
    pl = _create_playlist(client)
    resp = client.get("/v1/playlists/me")
    assert resp.status_code == 200
    ids = [p["id"] for p in resp.json()]
    assert pl["id"] in ids


def test_playlist_search_returns_results_wrapper(client):
    register(client, "plsearch")
    t = unique("searchable_playlist")
    _create_playlist(client, title=t)
    resp = client.get(f"/v1/playlists/search?title={t[:12]}")
    assert resp.status_code == 200
    assert "results" in resp.json()


def test_playlist_search_excludes_own(client):
    register(client, "plsearchexcl")
    me = client.get("/v1/users/me").json()
    t = unique("ownpl")
    _create_playlist(client, title=t)
    resp = client.get(f"/v1/playlists/search?title={t[:6]}")
    results = resp.json()["results"]
    author_ids = [p["author"] for p in results]
    assert me["id"] not in author_ids


def test_playlist_detail(client):
    register(client, "pldetail")
    pl = _create_playlist(client)
    resp = client.get(f"/v1/playlists/{pl['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == pl["id"]
    assert "followersPlaylist" in resp.json()


def test_playlist_detail_not_found_returns_404(client):
    register(client, "plnotfound")
    resp = client.get("/v1/playlists/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_playlist_update(client):
    register(client, "plupdate")
    pl = _create_playlist(client)
    resp = client.patch(f"/v1/playlists/{pl['id']}", data={"title": "Updated Title"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


def test_playlist_update_forbidden_for_non_owner(client):
    a = register(client, "plforbida")
    logout(client)
    b = register(client, "plforbidb")
    logout(client)
    login(client, a["email"])
    pl = _create_playlist(client)
    logout(client)
    login(client, b["email"])
    resp = client.patch(f"/v1/playlists/{pl['id']}", data={"title": "Hacked"})
    assert resp.status_code == 403


def test_playlist_delete(client):
    register(client, "pldelete")
    pl = _create_playlist(client)
    resp = client.delete(f"/v1/playlists/{pl['id']}")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
    assert client.get(f"/v1/playlists/{pl['id']}").status_code == 404


# ---------------------------------------------------------------------------
# Playlist media
# ---------------------------------------------------------------------------

def test_playlist_add_and_remove_media(client):
    register(client, "plmedia")
    pl = _create_playlist(client)
    movie = _create_movie(client)
    resp = client.post(f"/v1/playlists/{pl['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    assert resp.status_code == 200
    medias = resp.json()["medias"]
    assert any(m["mediaId"] == movie["mediaId"] for m in medias)

    resp = client.request("DELETE", f"/v1/playlists/{pl['id']}/media", json={"mediaIdDelete": movie["mediaId"]})
    assert resp.status_code == 200
    assert not any(m["mediaId"] == movie["mediaId"] for m in resp.json()["medias"])


def test_playlist_add_duplicate_media_returns_404(client):
    register(client, "plmediadupe")
    pl = _create_playlist(client)
    movie = _create_movie(client)
    client.post(f"/v1/playlists/{pl['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    resp = client.post(f"/v1/playlists/{pl['id']}/media", json={"mediaId": movie["mediaId"], "media_type": "movie", "runtime": 100})
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Playlist follow / like / unfollow
# ---------------------------------------------------------------------------

def _two_users_with_playlist(client):
    a = register(client, "fpla")
    pl = _create_playlist(client)
    logout(client)
    b = register(client, "fplb")
    return a, b, pl


def test_playlist_follow(client):
    a, b, pl = _two_users_with_playlist(client)
    resp = client.post(f"/v1/playlists/{pl['id']}/follow")
    assert resp.status_code == 200
    assert resp.json()["userId"] == b["id"]


def test_playlist_follow_own_returns_404(client):
    a = register(client, "ownfpl")
    pl = _create_playlist(client)
    resp = client.post(f"/v1/playlists/{pl['id']}/follow")
    assert resp.status_code == 404


def test_playlist_follow_detail(client):
    a, b, pl = _two_users_with_playlist(client)
    client.post(f"/v1/playlists/{pl['id']}/follow")
    resp = client.get(f"/v1/playlists/{pl['id']}/follow")
    assert resp.status_code == 200
    assert resp.json()["playlistId"] == pl["id"]


def test_playlist_follow_detail_not_following_returns_empty(client):
    register(client, "notfollowpl")
    pl_owner = register(client, "plowner_for_nf") if False else None
    # just check that get returns 200 with empty body when not following
    logout(client)
    a = register(client, "notfollowcheck")
    logout(client)
    b = register(client, "notfollowcheck_owner")
    pl = _create_playlist(client)
    logout(client)
    login(client, a["email"])
    resp = client.get(f"/v1/playlists/{pl['id']}/follow")
    assert resp.status_code == 200
    assert resp.json() == {}


def test_playlist_like(client):
    a, b, pl = _two_users_with_playlist(client)
    client.post(f"/v1/playlists/{pl['id']}/follow")
    resp = client.patch(f"/v1/playlists/{pl['id']}/follow", json={"like": True})
    assert resp.status_code == 200
    assert resp.json()["like"] is True


def test_playlist_unfollow(client):
    a, b, pl = _two_users_with_playlist(client)
    client.post(f"/v1/playlists/{pl['id']}/follow")
    resp = client.delete(f"/v1/playlists/{pl['id']}/follow")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
