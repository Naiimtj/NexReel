#!/usr/bin/env python3
"""Exhaustive local endpoint test for the NexReel backend.

Safety:
  * Uses two TEMP users (timestamped) for all mutations; deletes them at the end.
  * Cleans up every entity it creates via the corresponding DELETE endpoint.
  * NEVER touches existing data, NEVER runs backup/restore or import (destructive),
    NEVER calls Plex sync (left for manual testing per request).
  * Reads credentials from the real .env files (already loaded by the caller).

Run:  BASE=http://localhost:8000 ADMIN_PW=... python3 scripts/full_api_test.py
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from http.cookiejar import CookieJar

BASE = os.environ.get("BASE", "http://localhost:8000").rstrip("/")
ADMIN_PW = os.environ.get("ADMIN_PW", "")

results: list[tuple[str, str, bool, str]] = []
_created = {"users": [], "playlists": [], "forums": [], "messages": [], "media": []}


def _opener() -> urllib.request.OpenerDirector:
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))


def call(name, opener, method, path, *, json_body=None, form=None, multipart=None,
         headers=None, expect=(200,)):
    url = BASE + path
    data = None
    hdrs = dict(headers or {})
    if json_body is not None:
        data = json.dumps(json_body).encode()
        hdrs["Content-Type"] = "application/json"
    elif form is not None:
        data = urllib.parse.urlencode(form).encode()
        hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    elif multipart is not None:
        boundary = "----nexreeltest%d" % int(time.time() * 1000)
        field, filename, content, ctype = multipart
        body = b"".join([
            b"--", boundary.encode(), b"\r\n",
            b'Content-Disposition: form-data; name="', field.encode(),
            b'"; filename="', filename.encode(), b'"\r\n',
            b"Content-Type: ", ctype.encode(), b"\r\n\r\n",
            content, b"\r\n", b"--", boundary.encode(), b"--\r\n",
        ])
        data = body
        hdrs["Content-Type"] = "multipart/form-data; boundary=" + boundary
    req = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    try:
        with opener.open(req, timeout=30) as resp:
            status = resp.status
            raw = resp.read().decode() or ""
    except urllib.error.HTTPError as e:
        status = e.code
        raw = e.read().decode() or ""
    except Exception as e:  # noqa: BLE001
        results.append((name, f"{method} {path}", False, f"EXC {e}"))
        return None, None
    ok = status in expect
    if not ok and status >= 500:
        ok = False
    results.append((name, f"{method} {path}", ok, f"{status}"))
    try:
        body = json.loads(raw) if raw else None
    except Exception:  # noqa: BLE001
        body = raw
    return status, body


def main() -> int:
    admin = _opener()  # for /db/* (header auth, no cookies needed)
    a = _opener()      # temp user A (cookie session)
    b = _opener()      # temp user B (cookie session)
    ts = int(time.time())

    # ── System ──────────────────────────────────────────────────────────
    call("health", admin, "GET", "/health")

    # ── Negative auth checks ────────────────────────────────────────────
    call("auth: no-cookie 401", _opener(), "GET", "/v1/users", expect=(401,))
    call("backup: no-header 401", _opener(), "POST", "/db/backup", expect=(401,))
    call("backup: bad-header 403", _opener(), "POST", "/db/backup",
         headers={"X-Admin-Password": "wrong"}, expect=(403,))

    # ── Backup (safe operations only) ───────────────────────────────────
    ah = {"X-Admin-Password": ADMIN_PW}
    call("backup: create", admin, "POST", "/db/backup", headers=ah)
    call("backup: list", admin, "GET", "/db/backup/list", headers=ah)
    call("backup: import non-sql 400", admin, "POST", "/db/import", headers=ah,
         multipart=("file", "x.txt", b"hello", "text/plain"), expect=(400,))
    call("backup: import empty 400", admin, "POST", "/db/import", headers=ah,
         multipart=("file", "x.sql", b"", "application/sql"), expect=(400,))

    # ── Register two temp users ─────────────────────────────────────────
    ua = f"tstuser_a_{ts}"
    ub = f"tstuser_b_{ts}"
    _, ra = call("register A", a, "POST", "/v1/register",
                 form={"email": f"{ua}@test.local", "username": ua,
                       "password": "Passw0rd!", "region": "ES",
                       "favoritePhrase": "hello"})
    _, rb = call("register B", b, "POST", "/v1/register",
                 form={"email": f"{ub}@test.local", "username": ub,
                       "password": "Passw0rd!", "region": "ES"})
    id_a = (ra or {}).get("id") if isinstance(ra, dict) else None
    id_b = (rb or {}).get("id") if isinstance(rb, dict) else None
    if id_a:
        _created["users"].append(("A", a, id_a))
    if id_b:
        _created["users"].append(("B", b, id_b))
    if not id_a or not id_b:
        print("FATAL: could not register temp users; aborting mutation tests.")
        _summary()
        return 1

    # ── Login negative + logout/login round-trip on A ───────────────────
    call("login wrong-pass 401", _opener(), "POST", "/v1/login",
         json_body={"email": f"{ua}@test.local", "password": "nope"}, expect=(401,))

    # ── Users reads ─────────────────────────────────────────────────────
    call("users list", a, "GET", "/v1/users")
    call("users search", a, "GET", f"/v1/users/search?username={ub}")
    call("users me", a, "GET", "/v1/users/me")
    call("user detail (B)", a, "GET", f"/v1/users/{id_b}")
    call("user followers", a, "GET", "/v1/user/followers")

    # ── Update me + notifications ───────────────────────────────────────
    call("update me", a, "PATCH", "/v1/users/me",
         form={"favoritePhrase": "updated"})
    call("notifications", a, "PATCH", "/v1/users/me/notifications",
         json_body={"notificationsRead": True})

    # ── API token flow (A) ──────────────────────────────────────────────
    _, tok = call("token create", a, "POST", "/v1/users/me/token")
    token = (tok or {}).get("token") if isinstance(tok, dict) else None
    if token:
        call("token use (X-User-Token)", _opener(), "GET", "/v1/users/me",
             headers={"X-User-Token": token})
        call("token bad 401", _opener(), "GET", "/v1/users/me",
             headers={"X-User-Token": "invalid"}, expect=(401,))
    call("token revoke", a, "DELETE", "/v1/users/me/token")

    # ── Follow flow (A follows B, B confirms) ───────────────────────────
    call("follow self 403", a, "POST", f"/v1/users/{id_a}/follows", expect=(403,))
    call("A follows B", a, "POST", f"/v1/users/{id_b}/follows")
    call("dup follow 404", a, "POST", f"/v1/users/{id_b}/follows", expect=(404,))
    call("B confirms A", b, "POST", f"/v1/users/{id_a}/follow")
    call("follow detail", a, "GET", f"/v1/users/{id_b}/follow")

    # ── Playlists (A owns) ──────────────────────────────────────────────
    _, pl = call("playlist create", a, "POST", "/v1/playlists",
                 form={"title": f"pl_{ts}", "description": "d", "tags": "action"})
    pid = (pl or {}).get("id") if isinstance(pl, dict) else None
    if pid:
        _created["playlists"].append((a, pid))
    call("playlists list", a, "GET", "/v1/playlists")
    call("playlists me", a, "GET", "/v1/playlists/me")
    call("playlists search (B)", b, "GET", f"/v1/playlists/search?title=pl_{ts}")
    if pid:
        call("playlist detail", a, "GET", f"/v1/playlists/{pid}")
        call("playlist update", a, "PATCH", f"/v1/playlists/{pid}",
             form={"title": f"pl_{ts}_upd"})
        call("playlist media add", a, "POST", f"/v1/playlists/{pid}/media",
             json_body={"mediaId": "900001", "media_type": "movie", "runtime": 120})
        call("playlist media del", a, "DELETE", f"/v1/playlists/{pid}/media",
             json_body={"mediaIdDelete": "900001"})
        call("playlist follow (B)", b, "POST", f"/v1/playlists/{pid}/follow")
        call("playlist follow detail (B)", b, "GET", f"/v1/playlists/{pid}/follow")
        call("playlist like (B)", b, "PATCH", f"/v1/playlists/{pid}/follow",
             json_body={"like": True})
        call("playlist unfollow (B)", b, "DELETE", f"/v1/playlists/{pid}/follow")

    # ── Forums (A owns) ─────────────────────────────────────────────────
    _, fo = call("forum create", a, "POST", "/v1/forums",
                 form={"title": f"fo_{ts}", "shortDescription": "s",
                       "description": "d", "tags": "drama"})
    fid = (fo or {}).get("id") if isinstance(fo, dict) else None
    if fid:
        _created["forums"].append((a, fid))
    call("forums list", a, "GET", "/v1/forums")
    fmid = None
    if fid:
        call("forum detail", a, "GET", f"/v1/forums/{fid}")
        call("forum update", a, "PATCH", f"/v1/forums/{fid}",
             form={"title": f"fo_{ts}_upd"})
        call("forum media add", a, "POST", f"/v1/forums/{fid}/media",
             json_body={"mediaId": "900001", "media_type": "movie", "runtime": 120})
        call("forum media del", a, "DELETE", f"/v1/forums/{fid}/media",
             json_body={"mediaIdDelete": "900001"})
        call("forum follow (B)", b, "POST", f"/v1/forums/{fid}/follow")
        call("forum like (B)", b, "PATCH", f"/v1/forums/{fid}/follow",
             json_body={"like": True})
        call("forum unfollow (B)", b, "DELETE", f"/v1/forums/{fid}/follow")
        _, fm = call("forum message create", a, "POST",
                     f"/v1/forums/{fid}/messages",
                     json_body={"textMessage": "hi forum"})
        fmid = (fm or {}).get("id") if isinstance(fm, dict) else None
        call("forum messages list", a, "GET", f"/v1/forums/{fid}/messages")
        if fmid:
            call("forum message detail", a, "GET",
                 f"/v1/forums/{fid}/messages/{fmid}")

    # ── Direct messages (A → B) ─────────────────────────────────────────
    _, dm = call("dm create", a, "POST", f"/v1/users/{id_b}/messages",
                 json_body={"textMessage": "hi B"})
    dmid = (dm or {}).get("id") if isinstance(dm, dict) else None
    call("dm list", a, "GET", f"/v1/users/{id_b}/messages")
    if dmid:
        call("dm detail", a, "GET", f"/v1/users/{id_b}/messages/{dmid}")
        call("dm update", a, "PATCH", f"/v1/messages/{dmid}",
             json_body={"textMessage": "edited"})
        call("dm delete", a, "DELETE", f"/v1/messages/{dmid}")

    # ── Media: movie (A) ────────────────────────────────────────────────
    call("media create movie", a, "POST", "/v1/medias/movie",
         json_body={"mediaId": "900001", "seen": True, "vote": 8, "runtime": 120})
    call("media dup 409", a, "POST", "/v1/medias/movie",
         json_body={"mediaId": "900001"}, expect=(409,))
    call("media list", a, "GET", "/v1/medias")
    call("media detail", a, "GET", "/v1/medias/movie/900001")
    call("media update", a, "PATCH", "/v1/medias/movie/900001",
         json_body={"like": True})
    call("media delete", a, "DELETE", "/v1/medias/900001", expect=(200, 404))

    # ── Media: TV + seasons + episodes (A) ──────────────────────────────
    call("tv create", a, "POST", "/v1/medias/tv",
         json_body={"mediaId": "900002", "number_seasons": 2,
                    "number_of_episodes": 8, "runtime": 45, "pending": True})
    call("season create", a, "POST", "/v1/seasons/900002",
         json_body={"season": 1, "number_seasons": 2,
                    "number_of_episodes": 8, "runtime": 400})
    call("season list", a, "GET", "/v1/seasons/900002")
    call("season detail", a, "GET", "/v1/seasons/900002/1")
    call("season patch unsee", a, "PATCH", "/v1/seasons/900002/1",
         json_body={"seen": False})
    call("episode create", a, "POST", "/v1/episodes/900002/1/1",
         json_body={"number_seasons": 2, "number_of_episodes": 8, "runtime": 45})
    call("episode detail", a, "GET", "/v1/episodes/900002/1/1")
    call("episode list", a, "GET", "/v1/episodes/900002/1")
    call("episode patch", a, "PATCH", "/v1/episodes/900002/1/1",
         json_body={"seen": True, "like": True})
    call("episode delete", a, "DELETE", "/v1/episodes/900002/1/1",
         expect=(200, 404))
    call("tv delete", a, "DELETE", "/v1/medias/900002", expect=(200, 404))

    # ── Plex: SKIPPED (manual per request) ──────────────────────────────
    results.append(("plex", "GET/POST /v1/plex* (SKIPPED — manual)", True, "skip"))

    # ── Cleanup: reject follow, delete forum/playlist, delete users ─────
    call("A unfollows B", a, "DELETE", f"/v1/users/{id_b}/nofollow",
         expect=(200, 404))
    if fmid and fid:
        call("cleanup forum message", a, "DELETE", f"/v1/messages/{fmid}",
             expect=(200, 404))
    for opener, pid_ in _created["playlists"]:
        call("cleanup playlist", opener, "DELETE", f"/v1/playlists/{pid_}",
             expect=(200, 404))
    for opener, fid_ in _created["forums"]:
        call("cleanup forum", opener, "DELETE", f"/v1/forums/{fid_}",
             expect=(200, 404))
    for label, opener, _uid in _created["users"]:
        call(f"delete user {label}", opener, "DELETE", "/v1/users/me",
             expect=(200, 404))

    call("logout A", a, "POST", "/v1/logout")
    return _summary()


def _summary() -> int:
    passed = sum(1 for *_ , ok, _s in ((r[0], r[1], r[2], r[3]) for r in results) if ok)
    total = len(results)
    failed = total - passed
    print("\n" + "=" * 72)
    print(f"{'RESULT':6}  {'STATUS':6}  NAME  ->  ENDPOINT")
    print("-" * 72)
    for name, ep, ok, status in results:
        print(f"{'PASS' if ok else 'FAIL':6}  {status:6}  {name}  ->  {ep}")
    print("-" * 72)
    print(f"TOTAL={total}  PASS={passed}  FAIL={failed}")
    print("=" * 72)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
