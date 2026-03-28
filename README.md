# SpendWiseApp

## Run with Docker (recommended)

### Prerequisites

- Docker Desktop (or Docker Engine) installed and running
- From project root (`SpendWiseApp/`)

### Option A — Full stack (PostgreSQL + Nginx + Backend + Frontend)

Use this for local development with a local Postgres container.

```bash
docker compose -f docker-compose.yml up --build
```

- App (via Nginx): `http://localhost:3000`
- Backend (direct): `http://localhost:5001`
- PostgreSQL (from host tools): `127.0.0.1:54321`

Stop:

```bash
docker compose -f docker-compose.yml down
```

Reset everything (including DB data):

```bash
docker compose -f docker-compose.yml down -v
```

### Option B — App only (no Postgres in Compose)

Use this when your database is outside Docker (e.g. RDS PostgreSQL, a remote Postgres, etc.).

```bash
docker compose -f docker-compose.app.yml up --build
```

- App (via Nginx): `http://localhost:3000`
- Backend (direct): `http://localhost:5000` (note: port `5000` may conflict on macOS; see below)

## Database notes

### Why `54321:5432`?

In `docker-compose.yml`, Postgres listens on port `5432` inside the container, but is mapped to `54321` on your machine:

- **container**: `5432`
- **host**: `54321`

This avoids conflicts if your laptop already runs Postgres on `5432`.

### Connect with DBeaver (local Postgres container)

When using **Option A** (`docker-compose.yml`):

- **Host**: `127.0.0.1`
- **Port**: `54321`
- **Database**: `spendwise`
- **Username**: `admin`
- **Password**: `letmein12345`

SSL: usually disabled for local Docker (`sslmode=disable` or off in DBeaver).

### Backend env files (DB inside Docker vs outside)

- **`docker-compose-env/backend.env`** (used by `docker-compose.yml`)
  - For DB inside Docker Compose
  - `DB_HOST=postgres`
- **`docker-compose-env/backend.app.env`** (used by `docker-compose.app.yml`)
  - For DB outside Docker Compose (example: RDS)
  - Set `DB_HOST=<rds-endpoint>` (do not use `localhost` from inside a container unless you use `host.docker.internal` on Docker Desktop)

## Common issues

### Port 5000 already in use (macOS)

If Docker fails with `bind: address already in use` on port `5000`, something on macOS (often `ControlCenter`) may be listening on `5000`.

Fix: change the host mapping in compose, e.g.:

- from `5000:5000` to `5001:5000`

(`docker-compose.yml` already maps backend to `5001:5000`.)

### Switched from MySQL — clean up old Docker resources

If you previously ran this stack with MySQL, stop everything and drop Compose volumes so only the current Postgres setup remains:

```bash
docker compose -f docker-compose.yml down --remove-orphans -v
docker compose -f docker-compose.yml up --build
```

Optional: remove unused MySQL images after you no longer need them:

```bash
docker images | grep -E 'mysql|mariadb'
docker rmi <image_id>
```

Orphan volumes from old projects can be listed with `docker volume ls` and removed with `docker volume rm <name>` if you are sure they are unused.
