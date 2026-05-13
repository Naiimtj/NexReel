from __future__ import annotations

from tests.conftest import register, unique


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_movie(client, media_id: str | None = None) -> dict:
    mid = media_id or unique("movie")
    resp = client.post("/v1/medias/movie", json={
        "mediaId": mid,
        "media_type": "movie",
        "runtime": 120,
        "seen": True,
        "pending": False,
        "like": True,
        "vote": 8,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


def _create_tv(client, media_id: str | None = None) -> dict:
    mid = media_id or unique("tv")
    resp = client.post("/v1/medias/tv", json={
        "mediaId": mid,
        "media_type": "tv",
        "runtime": 50,
        "number_seasons": 2,
        "number_of_episodes": 20,
        "runtime_seen": 0,
        "runtime_seasons": [0, 50, 52],
        "seen": False,
        "pending": True,
        "like": False,
        "vote": -1,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Movie CRUD
# ---------------------------------------------------------------------------

def test_create_movie(client):
    register(client, "moviecreate")
    movie = _create_movie(client)
    assert movie["media_type"] == "movie"
    assert movie["seen"] is True
    assert movie["vote"] == 8.0


def test_create_movie_duplicate_returns_409(client):
    register(client, "moviedupe")
    mid = unique("dupmovie")
    _create_movie(client, mid)
    resp = client.post("/v1/medias/movie", json={"mediaId": mid, "media_type": "movie", "runtime": 90})
    assert resp.status_code == 409


def test_list_media(client):
    register(client, "medialist")
    _create_movie(client)
    resp = client.get("/v1/medias")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_movie_detail(client):
    register(client, "moviedetail")
    movie = _create_movie(client)
    resp = client.get(f"/v1/medias/movie/{movie['mediaId']}")
    assert resp.status_code == 200
    assert resp.json()["mediaId"] == movie["mediaId"]


def test_movie_detail_not_found_returns_empty(client):
    register(client, "movienotfound")
    resp = client.get("/v1/medias/movie/does-not-exist")
    assert resp.status_code == 200
    assert resp.json() == {}


def test_update_movie(client):
    register(client, "movieupdate")
    movie = _create_movie(client)
    resp = client.patch(f"/v1/medias/movie/{movie['mediaId']}", json={"like": False, "vote": 7.5})
    assert resp.status_code == 200
    assert resp.json()["vote"] == 7.5
    assert resp.json()["like"] is False


def test_delete_movie(client):
    register(client, "moviedelete")
    movie = _create_movie(client)
    resp = client.delete(f"/v1/medias/{movie['mediaId']}")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
    assert client.get(f"/v1/medias/movie/{movie['mediaId']}").json() == {}


# ---------------------------------------------------------------------------
# TV CRUD
# ---------------------------------------------------------------------------

def test_create_tv(client):
    register(client, "tvcreate")
    tv = _create_tv(client)
    assert tv["media_type"] == "tv"
    assert tv["pending"] is True
    assert tv["number_seasons"] == 2


def test_tv_detail_includes_seasons(client):
    register(client, "tvdetail")
    tv = _create_tv(client)
    resp = client.get(f"/v1/medias/tv/{tv['mediaId']}")
    assert resp.status_code == 200
    body = resp.json()
    assert "seasons" in body


def test_update_tv(client):
    register(client, "tvupdate")
    tv = _create_tv(client)
    resp = client.patch(f"/v1/medias/tv/{tv['mediaId']}", json={"seen": True, "pending": False, "vote": 9.0})
    assert resp.status_code == 200
    assert resp.json()["seen"] is True


def test_delete_tv_removes_seasons(client):
    register(client, "tvdelete")
    tv = _create_tv(client)
    resp = client.delete(f"/v1/medias/{tv['mediaId']}")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


# ---------------------------------------------------------------------------
# TV Seasons
# ---------------------------------------------------------------------------

def test_season_list(client):
    register(client, "seasonlist")
    tv = _create_tv(client)
    resp = client.get(f"/v1/seasons/{tv['mediaId']}")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_season_detail(client):
    register(client, "seasondetail")
    tv = _create_tv(client)
    seasons = client.get(f"/v1/seasons/{tv['mediaId']}").json()
    if seasons:
        s = seasons[0]
        resp = client.get(f"/v1/seasons/{tv['mediaId']}/{s['season']}")
        assert resp.status_code == 200


def test_season_update(client):
    register(client, "seasonupdate")
    tv = _create_tv(client)
    seasons = client.get(f"/v1/seasons/{tv['mediaId']}").json()
    if seasons:
        s = seasons[0]
        resp = client.patch(f"/v1/seasons/{tv['mediaId']}/{s['season']}", json={"seen": True, "pending": False, "vote": 7.0})
        assert resp.status_code == 200
        assert resp.json()["seen"] is True


def test_season_create(client):
    register(client, "seasoncreate")
    tv = _create_tv(client)
    resp = client.post(f"/v1/seasons/{tv['mediaId']}", json={
        "season": 99,
        "media_type": "tv",
        "number_seasons": 2,
        "number_of_episodes": 10,
        "runtime": 45,
        "pending": True,
    })
    assert resp.status_code == 200


def test_season_create_duplicate_returns_404(client):
    register(client, "seasondup")
    tv = _create_tv(client)
    seasons = client.get(f"/v1/seasons/{tv['mediaId']}").json()
    if seasons:
        s = seasons[0]
        resp = client.post(f"/v1/seasons/{tv['mediaId']}", json={
            "season": s["season"],
            "media_type": "tv",
            "number_seasons": 2,
            "number_of_episodes": 10,
        })
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# TV Episodes
# ---------------------------------------------------------------------------

def test_episode_create_and_detail(client):
    register(client, "epcreat")
    tv = _create_tv(client)
    resp = client.post(f"/v1/episodes/{tv['mediaId']}/1/1", json={
        "media_type": "tv",
        "number_seasons": 2,
        "number_of_episodes": 10,
        "idEpisode": "ep-101",
        "runtime": 45,
        "pending": True,
    })
    assert resp.status_code == 200
    detail = client.get(f"/v1/episodes/{tv['mediaId']}/1/1")
    assert detail.status_code == 200
    assert detail.json()["idEpisode"] == "ep-101"


def test_episode_list(client):
    register(client, "eplist")
    tv = _create_tv(client)
    client.post(f"/v1/episodes/{tv['mediaId']}/1/1", json={"media_type": "tv", "number_seasons": 2, "number_of_episodes": 10, "idEpisode": "ep-101", "runtime": 45, "pending": True})
    resp = client.get(f"/v1/episodes/{tv['mediaId']}/1")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_episode_update(client):
    register(client, "epupdate")
    tv = _create_tv(client)
    client.post(f"/v1/episodes/{tv['mediaId']}/1/1", json={"media_type": "tv", "number_seasons": 2, "number_of_episodes": 10, "idEpisode": "ep-101", "runtime": 45, "pending": True})
    resp = client.patch(f"/v1/episodes/{tv['mediaId']}/1/1", json={"seen": True, "pending": False, "vote": 8.5})
    assert resp.status_code == 200
    assert resp.json()["seen"] is True


def test_episode_delete(client):
    register(client, "epdelete")
    tv = _create_tv(client)
    client.post(f"/v1/episodes/{tv['mediaId']}/1/1", json={"media_type": "tv", "number_seasons": 2, "number_of_episodes": 10, "idEpisode": "ep-101", "runtime": 45, "pending": True})
    resp = client.delete(f"/v1/episodes/{tv['mediaId']}/1/1")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


def test_episode_detail_not_found_returns_false(client):
    register(client, "epnotfound")
    tv = _create_tv(client)
    resp = client.get(f"/v1/episodes/{tv['mediaId']}/9/99")
    assert resp.status_code == 200
    assert resp.json() == {"result": False}
