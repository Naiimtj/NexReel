from __future__ import annotations

from tests.conftest import login, logout, register, unique


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

def test_register_creates_user(client):
    u = unique("reg")
    resp = client.post(
        "/v1/register",
        data={"email": f"{u}@test.com", "username": u, "password": "Pass1234!", "region": "ES"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["username"] == u
    assert body["email"] == f"{u}@test.com"
    assert "password" not in body


def test_register_duplicate_email_returns_400(client):
    u = unique("dup")
    data = {"email": f"{u}@test.com", "username": u, "password": "Pass1234!", "region": "ES"}
    client.post("/v1/register", data=data)
    data2 = dict(data)
    data2["username"] = unique("other")
    resp = client.post("/v1/register", data=data2)
    assert resp.status_code == 400
    assert "email" in resp.json()["detail"]["errors"]


def test_register_duplicate_username_returns_400(client):
    u = unique("dupuser")
    data = {"email": f"{u}@test.com", "username": u, "password": "Pass1234!", "region": "ES"}
    client.post("/v1/register", data=data)
    data2 = dict(data)
    data2["email"] = f"{unique('other')}@test.com"
    resp = client.post("/v1/register", data=data2)
    assert resp.status_code == 400
    assert "username" in resp.json()["detail"]["errors"]


def test_register_auto_logs_in(client):
    register(client, "autologin")
    resp = client.get("/v1/users/me")
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Login / Logout
# ---------------------------------------------------------------------------

def test_login_valid_credentials(client):
    u = unique("login")
    email = f"{u}@test.com"
    client.post("/v1/register", data={"email": email, "username": u, "password": "Pass1234!", "region": "ES"})
    logout(client)
    resp = client.post("/v1/login", json={"email": email, "password": "Pass1234!"})
    assert resp.status_code == 200
    assert resp.json()["email"] == email


def test_login_wrong_password_returns_401(client):
    u = unique("badpwd")
    email = f"{u}@test.com"
    client.post("/v1/register", data={"email": email, "username": u, "password": "Pass1234!", "region": "ES"})
    logout(client)
    resp = client.post("/v1/login", json={"email": email, "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_email_returns_401(client):
    resp = client.post("/v1/login", json={"email": "nobody@test.com", "password": "Pass1234!"})
    assert resp.status_code == 401


def test_logout_returns_result(client):
    register(client, "logoutuser")
    resp = client.post("/v1/logout")
    assert resp.status_code == 200
    assert resp.json() == {"result": True}


def test_logout_clears_session(client):
    register(client, "logoutsession")
    client.post("/v1/logout")
    resp = client.get("/v1/users/me")
    assert resp.status_code == 401


def test_unauthenticated_access_returns_401(client):
    resp = client.get("/v1/users/me")
    assert resp.status_code == 401
