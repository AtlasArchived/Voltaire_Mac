# Voltaire (Mac)

Desktop and browser experience for learning French: **Next.js** frontend, **FastAPI** backend, optional **Electron** shell.

## Consumer install (recommended)

1. Clone or unzip this repo to a folder on your Mac (avoid iCloud-only synced folders if you hit file-lock issues with Next.js).
2. In Terminal: `chmod +x install_mac.sh start.sh tunnel.sh stop_voltaire.sh`
3. Run **`./install_mac.sh` once** — installs Homebrew/Python/Node if needed, Python + npm deps, **builds the frontend for production**, and creates `cato_mind.db` via `init_db.py`.
4. Copy **`.env.example`** to **`.env`** and set **`CATO_GEMINI_KEY`** (free key: [Google AI Studio](https://aistudio.google.com)).
5. Launch with **`./start.sh`** or double-click **`Voltaire.app`** (headless servers + Electron when `npm install` was run at the repo root).

Logs: `logs/`. Stop background servers: **`StopVoltaire.app`** or `./stop_voltaire.sh`.

More detail (phone access, Cloudflare tunnel): **[README_MAC.md](./README_MAC.md)**.

## Development

- **Backend:** from repo root, `python3 -m uvicorn backend.main:app --reload --port 8000`
- **Frontend:** `cd frontend && npm run dev`
- **Electron (uses running servers):** from root, `npm install` then `VOLTAIRE_EXTERNAL_SERVER=1 npm run desktop` after backend + frontend are up — or use `./start.sh` which sets that for you.

## Packaged Mac app (DMG)

```bash
npm install
npm run dist:mac
```

Output: `dist/`. The bundle **does not** ship `.env` or `cato_mind.db`; the app stores data under **Electron `userData`** and loads `.env` from there or from the app bundle if you add one for defaults.

## Next phase toward wide consumer rollout

| Area | Status / next step |
|------|---------------------|
| **Distribution** | Folder + `.app` stubs work today; DMG via `npm run dist:mac` (requires Python + Node on the machine unless you add bundled runtimes). |
| **Signing & Notarization** | Enroll in Apple Developer; sign with **Developer ID Application**; enable **hardened runtime** + **notarize** in `electron-builder` (entitlements for subprocesses if needed). |
| **Updates** | Add **auto-update** (e.g. `electron-updater` + release hosting) once you have signed builds. |
| **Secrets** | Never commit `.env`; use `.env.example` only. Packaged builds should read keys from user-editable `userData/.env` or OS keychain. |
| **Telemetry / privacy** | Document what leaves the device (e.g. Gemini API); add a short in-app or README privacy note before public launch. |

## Repo layout (high level)

- `backend/` — FastAPI app (`backend/main.py`)
- `frontend/` — Next.js 14 UI
- `electron/` — Desktop shell
- `Voltaire.app` / `StopVoltaire.app` — launchers that call `start.sh` / `stop_voltaire.sh`
- `init_db.py` — creates SQLite schema for fresh installs
