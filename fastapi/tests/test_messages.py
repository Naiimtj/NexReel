from __future__ import annotations

from tests.conftest import login, logout, register, unique


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_forum(client, title: str | None = None) -> dict:
    t = title or unique("msgforum")
    resp = client.post("/v1/forums", data={"title": t, "shortDescription": "s", "description": "d", "tags": '[]'})
    assert resp.status_code == 200
    return resp.json()


def _two_users(client):
    a = register(client, "msga")
    logout(client)
    b = register(client, "msgb")
    return a, b


# ---------------------------------------------------------------------------
# Forum messages
# ---------------------------------------------------------------------------

def test_forum_message_create(client):
    register(client, "fmsgcreate")
    f = _create_forum(client)
    resp = client.post(f"/v1/forums/{f['id']}/messages", json={"textMessage": "hello forum"})
    assert resp.status_code == 200
    assert resp.json()["textMessage"] == "hello forum"
    assert resp.json()["forum"] == f["id"]


def test_forum_messages_list(client):
    register(client, "fmsglist")
    f = _create_forum(client)
    client.post(f"/v1/forums/{f['id']}/messages", json={"textMessage": "msg1"})
    client.post(f"/v1/forums/{f['id']}/messages", json={"textMessage": "msg2"})
    resp = client.get(f"/v1/forums/{f['id']}/messages")
    assert resp.status_code == 200
    assert len(resp.json()) >= 2
    for m in resp.json():
        assert "userSender" in m


def test_forum_message_detail(client):
    register(client, "fmsgdetail")
    f = _create_forum(client)
    msg = client.post(f"/v1/forums/{f['id']}/messages", json={"textMessage": "detail msg"}).json()
    resp = client.get(f"/v1/forums/{f['id']}/messages/{msg['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == msg["id"]


def test_forum_message_detail_not_found_returns_404(client):
    register(client, "fmsgnotfound")
    f = _create_forum(client)
    resp = client.get(f"/v1/forums/{f['id']}/messages/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Direct messages
# ---------------------------------------------------------------------------

def test_user_message_create(client):
    a, b = _two_users(client)
    resp = client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "hello"})
    assert resp.status_code == 200
    assert resp.json()["textMessage"] == "hello"
    assert resp.json()["receiver"] == a["id"]


def test_user_messages_list(client):
    a, b = _two_users(client)
    client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "msg1"})
    client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "msg2"})
    resp = client.get(f"/v1/users/{a['id']}/messages")
    assert resp.status_code == 200
    assert len(resp.json()) >= 2
    for m in resp.json():
        assert "userSender" in m


def test_user_message_detail(client):
    a, b = _two_users(client)
    msg = client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "detail"}).json()
    resp = client.get(f"/v1/users/{a['id']}/messages/{msg['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == msg["id"]


def test_user_message_detail_not_found_returns_404(client):
    a, b = _two_users(client)
    resp = client.get(f"/v1/users/{a['id']}/messages/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Message update / delete
# ---------------------------------------------------------------------------

def test_message_update(client):
    a, b = _two_users(client)
    msg = client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "original"}).json()
    resp = client.patch(f"/v1/messages/{msg['id']}", json={"textMessage": "updated"})
    assert resp.status_code == 200
    assert resp.json()["textMessage"] == "updated"
    assert resp.json()["edited"] is True


def test_message_update_forbidden_for_non_sender(client):
    a, b = _two_users(client)
    msg = client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "original"}).json()
    logout(client)
    login(client, a["email"])
    resp = client.patch(f"/v1/messages/{msg['id']}", json={"textMessage": "hacked"})
    assert resp.status_code == 403


def test_message_delete(client):
    a, b = _two_users(client)
    msg = client.post(f"/v1/users/{a['id']}/messages", json={"textMessage": "bye"}).json()
    resp = client.delete(f"/v1/messages/{msg['id']}")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


def test_message_delete_not_found_returns_404(client):
    register(client, "msgdelnotfound")
    resp = client.delete("/v1/messages/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
