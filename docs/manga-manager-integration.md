# Connecting the Browse demo to the real Manga Manager module

## Why there is no live connection today

The uploaded module (`manga_manager/`) is a local Flask app:

- `GET /browse/<category>` renders `templates/browse.html` — **HTML, not JSON**.
- Every shelf read goes through `_load_shelf()`, which requires an unlocked
  vault tied to a **server-side session cookie** (`web.py`, vault unlock flow).
- The only JSON endpoints are `/api/suggest` (autocomplete, min 2 chars) and
  `/api/add` (write path, `X-API-Token` header).
- It listens on localhost by default and sends no CORS headers.

So a hosted web app cannot reach it as shipped. This demo therefore ships an
adapter layer with the module's exact schema and browse logic, and defaults to
a bundled counts snapshot.

## The data layer in this app

| File | Role |
| --- | --- |
| `src/lib/manga-manager.ts` | Schema (`MangaRecord` = `Manga.to_dict()`), `BROWSE_FIELDS`, `fieldCounts` (port of `_field_counts`), `sortEntries` (port of the `/browse` sort branch) |
| `src/lib/browse-source.ts` | `BrowseSource` adapter: `snapshotSource` (default) and `httpSource(baseUrl, token)` |
| `src/data/browse.ts` | The bundled snapshot, in browse shape |

The drawers are rendered from whatever `BrowseSource.load(sort)` returns — no
hardcoded categories in the UI.

## Configuration

```bash
# .env
VITE_MANGA_MANAGER_URL=http://127.0.0.1:5000
VITE_MANGA_MANAGER_TOKEN=<the same token /api/add uses>   # optional
```

With `VITE_MANGA_MANAGER_URL` set, the app calls:

```
GET {VITE_MANGA_MANAGER_URL}/api/shelf
X-API-Token: <VITE_MANGA_MANAGER_TOKEN>   # when provided
```

and expects:

```json
{ "manga": [ { "id": 1, "type": "Edo Rain", "author": ["Ayano Kuze"],
               "link": "...", "series": "Edo Rain", "thumbnail": null,
               "tags": ["Historical"], "characters": [], "groups": [],
               "favorites": 120, "date_added": "2024-05-02",
               "gallery_id": "1264", "uploaded_at": null,
               "last_checked_at": null, "status": "", "rating": null } ] }
```

That is `Manga.to_dict()` verbatim, so counting and sorting happen client-side
with the same rules as `web.py`.

## Endpoint to add to `web.py`

```python
@app.route("/api/shelf")
def api_shelf():
    if request.headers.get("X-API-Token") != _api_token():   # reuse /api/add's check
        return jsonify({"error": "unauthorized"}), 401
    manga_list, _ = _load_shelf()
    if manga_list is None:
        return jsonify({"error": "vault locked"}), 423
    return jsonify({"manga": [m.to_dict() for m in manga_list]})
```

Also required for a browser to call it cross-origin:

- CORS: allow the app's origin, and allow the `X-API-Token` header.
- Reachability: run the module on a host the browser can resolve (localhost is
  fine when the app is opened on the same machine), over HTTPS if the app is
  served over HTTPS.

Until that endpoint exists, the app stays on the bundled snapshot and says so
in the footer.
