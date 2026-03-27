# SpendWiseApp

## Run with Docker (recommended)

### Prerequisites

- Docker Desktop (or Docker Engine) installed and running
- From project root (`SpendWiseApp/`)

### Option A — Full stack (MySQL + Nginx + Backend + Frontend)

Use this for local development with a local MySQL container.

```bash
docker compose -f docker-compose.yml up --build
```

- App (via Nginx): `http://localhost:3000`
- Backend (direct): `http://localhost:5001`
- MySQL (from host tools): `127.0.0.1:33061`

Stop:

```bash
docker compose -f docker-compose.yml down
```

Reset everything (including DB data):

```bash
docker compose -f docker-compose.yml down -v
```

### Option B — App only (no MySQL)

Use this when your database is outside Docker (e.g. RDS, a remote MySQL, etc.).

```bash
docker compose -f docker-compose.app.yml up --build
```

- App (via Nginx): `http://localhost:3000`
- Backend (direct): `http://localhost:5000` (note: port `5000` may conflict on macOS; see below)

## Database notes

### Why `33061:3306`?

In `docker-compose.yml`, MySQL runs on port `3306` inside the container, but is mapped to `33061` on your machine:

- **container**: `3306`
- **host**: `33061`

This avoids conflicts if your laptop already uses port `3306`.

### Connect with DBeaver (local MySQL container)

When using **Option A** (`docker-compose.yml`):

- **Host**: `127.0.0.1`
- **Port**: `33061`
- **Database**: `spendwise`
- **Username**: `admin`
- **Password**: `letmein12345`

If you see `Public Key Retrieval is not allowed` in DBeaver, set:

- `allowPublicKeyRetrieval=true`
- `useSSL=false`

(or set these in DBeaver Driver Properties)

### Backend env files (DB inside Docker vs outside)

- **`docker-compose-env/backend.env`** (used by `docker-compose.yml`)
  - For DB inside Docker Compose
  - `DB_HOST=mysql`
- **`docker-compose-env/backend.app.env`** (used by `docker-compose.app.yml`)
  - For DB outside Docker Compose (example: RDS)
  - Set `DB_HOST=<rds-endpoint>` (do not use `localhost` unless DB is in the same container)

## Common issues

### Port 5000 already in use (macOS)

If Docker fails with `bind: address already in use` on port `5000`, something on macOS (often `ControlCenter`) may be listening on `5000`.

Fix: change the host mapping in compose, e.g.:

- from `5000:5000` to `5001:5000`

(`docker-compose.yml` already maps backend to `5001:5000`.)

# spendwise
