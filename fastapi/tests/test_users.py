from __future__ import annotations

from tests.conftest import login, logout, register, unique


# ---------------------------------------------------------------------------
# Users list / search / me / detail
# ---------------------------------------------------------------------------

def test_list_users_excludes_self(client):
    a = register(client, "lista")
    resp = client.get("/v1/users")
    assert resp.status_code == 200
    ids = [u["id"] for u in resp.json()]
    assert a["id"] not in ids


def test_search_users_returns_results_wrapper(client):
    u = unique("searchable")
    register(client, u)
    resp = client.get(f"/v1/users/search?username={u}")
    assert resp.status_code == 200
    body = resp.json()
    assert "results" in body


def test_search_users_excludes_self(client):
    register(client, "selfexclude")
    me = client.get("/v1/users/me").json()
    resp = client.get(f"/v1/users/search?username={me['username']}")
    assert resp.status_code == 200
    ids = [u["id"] for u in resp.json()["results"]]
    assert me["id"] not in ids


def test_users_me_returns_full_profile(client):
    register(client, "meuser")
    resp = client.get("/v1/users/me")
    assert resp.status_code == 200
    body = resp.json()
    for field in ("id", "email", "username", "followers", "following", "playlists", "forums", "medias", "mediasTv"):
        assert field in body, f"Missing field: {field}"


def test_user_detail_by_id(client):
    a = register(client, "detaila")
    logout(client)
    b = register(client, "detailb")
    resp = client.get(f"/v1/users/{a['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == a["id"]


def test_user_detail_not_found_returns_404(client):
    register(client, "detailnotfound")
    resp = client.get("/v1/users/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Update me
# ---------------------------------------------------------------------------

def test_update_me_changes_favorite_phrase(client):
    register(client, "updateme")
    resp = client.patch("/v1/users/me", data={"favoritePhrase": "new phrase"})
    assert resp.status_code == 200
    assert resp.json()["favoritePhrase"] == "new phrase"


def test_update_notifications(client):
    register(client, "notifuser")
    resp = client.patch("/v1/users/me/notifications", json={"notificationsRead": True})
    assert resp.status_code == 200
    assert resp.json()["notificationsRead"] is True


# ---------------------------------------------------------------------------
# Delete me
# ---------------------------------------------------------------------------

def test_delete_me(client):
    register(client, "deleteuser")
    resp = client.delete("/v1/users/me")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


# ---------------------------------------------------------------------------
# Followers
# ---------------------------------------------------------------------------

def _two_users(client):
    a = register(client, "folla")
    logout(client)
    b = register(client, "follb")
    return a, b


def test_follow_user(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    resp = client.post(f"/v1/users/{b['id']}/follows")
    assert resp.status_code == 200
    assert resp.json()["UserIDFollower"] == a["id"]


def test_follow_self_returns_403(client):
    a = register(client, "selff")
    resp = client.post(f"/v1/users/{a['id']}/follows")
    assert resp.status_code == 403


def test_follow_duplicate_returns_404(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    resp = client.post(f"/v1/users/{b['id']}/follows")
    assert resp.status_code == 404


def test_confirm_follow(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    logout(client)
    login(client, b["email"])
    resp = client.post(f"/v1/users/{a['id']}/follow")
    assert resp.status_code == 200
    assert resp.json()["UserConfirm"] is True


def test_follow_detail_not_confirmed(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    resp = client.get(f"/v1/users/{b['id']}/follow")
    assert resp.status_code == 200
    body = resp.json()
    assert body["isConfirm"] is False
    assert body["isFollowing"] is True


def test_follow_detail_confirmed(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    logout(client)
    login(client, b["email"])
    client.post(f"/v1/users/{a['id']}/follow")
    resp = client.get(f"/v1/users/{a['id']}/follow")
    assert resp.status_code == 200
    body = resp.json()
    assert body["isConfirm"] is True
    assert body["isFollowing"] is True


def test_followers_list(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    logout(client)
    login(client, b["email"])
    resp = client.get("/v1/user/followers")
    assert resp.status_code == 200
    follower_ids = [f["UserIDFollower"] for f in resp.json()]
    assert a["id"] in follower_ids


def test_unfollow_user(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    resp = client.delete(f"/v1/users/{b['id']}/nofollow")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


def test_delete_follower(client):
    a, b = _two_users(client)
    logout(client)
    login(client, a["email"])
    client.post(f"/v1/users/{b['id']}/follows")
    logout(client)
    login(client, b["email"])
    resp = client.delete(f"/v1/users/{a['id']}/follows")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}
