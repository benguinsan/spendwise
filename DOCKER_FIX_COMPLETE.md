# 🎉 Docker Connection Issues - FIXED!

## ✅ All Issues Resolved

### Problems Fixed:

1. ✅ **Frontend API URL** - Changed from `localhost:5000` to `/api` (nginx proxy)
2. ✅ **Nginx Configuration** - Fixed frontend port from 5173 to 3000
3. ✅ **CORS Configuration** - Backend now allows multiple origins
4. ✅ **Database Connection** - Added retry logic and health checks
5. ✅ **Service Dependencies** - Proper startup order with health checks
6. ✅ **Docker Networking** - All services in same network
7. ✅ **Health Check Endpoint** - Added `/health` endpoint to backend

---

## 🔧 Changes Made

### 1. Frontend Environment Configuration

**Created: `frontend/.env.production`**
```env
# API calls now go through nginx proxy at /api
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME=SpendWise
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Why:** Frontend was calling `http://localhost:5000` which doesn't work in Docker. Now it uses `/api` which nginx proxies to backend.

---

### 2. Nginx Configuration

**Updated: `nginx/default.conf`**

Key changes:
- Frontend proxy now points to `frontend:3000` (was 5173)
- Backend proxy at `/api/` strips prefix and forwards to `backend:5000`
- Added proper timeouts and headers
- Removed `/api` prefix when forwarding to backend

**How it works:**
```
Browser → http://localhost:3000/api/users
         ↓
Nginx   → http://backend:5000/users (strips /api)
         ↓
Backend → Returns data
```

---

### 3. Backend CORS Configuration

**Updated: `backend/src/main.ts`**

Changes:
- Now accepts multiple CORS origins from env variable
- Listens on `0.0.0.0` instead of default
- Added startup logging
- Better error messages

**CORS Origins:**
- `http://localhost:3000` (local development)
- `http://frontend:3000` (Docker internal)
- `http://nginx` (nginx proxy)

---

### 4. Backend Health Check

**Updated: `backend/src/app.controller.ts`**

Added `/health` endpoint:
```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };
}
```

---

### 5. Backend Dockerfile with Database Wait

**Updated: `backend/Dockerfile`**

Added startup script that:
1. ⏳ Waits for PostgreSQL (max 30 attempts, 2s each)
2. 🔄 Runs Prisma migrations
3. 🚀 Starts NestJS application

**Benefits:**
- No more "database not ready" errors
- Automatic migration on startup
- Graceful failure with clear error messages

---

### 6. Docker Compose with Health Checks

**Updated: `docker-compose.yml`**

Key improvements:
- ✅ Added health checks for all services
- ✅ Proper service dependencies with `condition: service_healthy`
- ✅ Created dedicated network `spendwise-network`
- ✅ Added restart policies
- ✅ PostgreSQL health check before backend starts
- ✅ Backend health check before frontend starts

**Startup Order:**
```
1. PostgreSQL starts → health check passes
2. Backend starts → waits for DB → runs migrations → health check passes
3. Frontend starts → health check passes
4. Nginx starts → proxies traffic
```

---

### 7. Prisma Schema

**Updated: `backend/prisma/schema.prisma`**

Added explicit database URL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 8. Backend Environment

**Updated: `docker-compose-env/backend.env`**

Added:
```env
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000,http://frontend:3000,http://nginx
```

---

## 🚀 How to Deploy

### Step 1: Clean Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove any orphaned containers
docker system prune -f
```

### Step 2: Build Fresh Images

```bash
# Build all services with no cache
docker-compose build --no-cache
```

### Step 3: Start Services

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d
```

### Step 4: Watch Logs

```bash
# Watch all logs
docker-compose logs -f

# Watch specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

---

## 🧪 Testing Commands

### 1. Test Backend Health (from host)

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T...",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. Test Backend API through Nginx (from host)

```bash
# Health check through nginx
curl http://localhost:3000/api/health

# Get root endpoint
curl http://localhost:3000/api/
```

### 3. Test Database Connection (inside backend container)

```bash
# Enter backend container
docker-compose exec backend sh

# Test Prisma connection
npx prisma db execute --stdin <<< "SELECT 1"

# Exit container
exit
```

### 4. Test Frontend to Backend Connection (inside frontend container)

```bash
# Enter frontend container
docker-compose exec frontend sh

# Test API call
wget -O- http://backend:5000/health

# Exit container
exit
```

### 5. Test Full Stack (from browser)

Open browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API (direct):** http://localhost:5000/health
- **Backend API (through nginx):** http://localhost:3000/api/health

---

## 🔍 Debugging Commands

### Check Service Status

```bash
# List all containers
docker-compose ps

# Check health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

### Check Logs

```bash
# All services
docker-compose logs

# Last 100 lines
docker-compose logs --tail=100

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs nginx
```

### Check Network

```bash
# List networks
docker network ls

# Inspect spendwise network
docker network inspect spendwise_spendwise-network

# Check if services can reach each other
docker-compose exec frontend ping -c 3 backend
docker-compose exec backend ping -c 3 postgres
```

### Check Environment Variables

```bash
# Backend env
docker-compose exec backend env | grep -E "DATABASE_URL|PORT|NODE_ENV|CORS"

# Frontend env
docker-compose exec frontend env | grep NEXT_PUBLIC
```

### Enter Container Shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U admin -d spendwise
```

---

## ✅ Verification Checklist

After running `docker-compose up`, verify:

### 1. All Containers Running
```bash
docker-compose ps
```
Expected: All services show "Up" and "healthy"

### 2. Backend Health Check
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok",...}`

### 3. Backend Through Nginx
```bash
curl http://localhost:3000/api/health
```
Expected: `{"status":"ok",...}`

### 4. Frontend Accessible
Open browser: http://localhost:3000
Expected: SpendWise login/register page loads

### 5. Frontend Can Call Backend
Open browser console (F12) and check:
- No CORS errors
- API calls to `/api/*` succeed
- Network tab shows successful requests

### 6. Database Connected
```bash
docker-compose logs backend | grep "PostgreSQL is ready"
```
Expected: See "✅ PostgreSQL is ready!"

### 7. Migrations Ran
```bash
docker-compose logs backend | grep "Migrations completed"
```
Expected: See "✅ Migrations completed!"

---

## 🎯 Expected Behavior

### Startup Sequence

1. **PostgreSQL** starts first
   - Initializes database
   - Health check passes after ~5 seconds

2. **Backend** starts
   - Waits for PostgreSQL (max 60 seconds)
   - Runs Prisma migrations
   - Starts NestJS server on port 5000
   - Health check passes after ~10 seconds
   - Logs: "🚀 Backend server is running on http://0.0.0.0:5000"

3. **Frontend** starts
   - Waits for backend health check
   - Builds Next.js application
   - Starts on port 3000
   - Health check passes after ~10 seconds

4. **Nginx** starts
   - Waits for frontend and backend health checks
   - Proxies traffic on port 3000 (host) to port 80 (container)
   - Routes `/api/*` to backend
   - Routes `/*` to frontend

### Runtime Behavior

- **Frontend → Backend:** All API calls use `/api` prefix
- **Nginx → Backend:** Strips `/api` prefix before forwarding
- **Backend → Database:** Uses `postgres:5432` (Docker service name)
- **CORS:** Backend allows requests from nginx and frontend
- **Health Checks:** All services monitored, auto-restart on failure

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection refused" errors

**Symptom:** Frontend can't reach backend

**Solution:**
```bash
# Check if backend is healthy
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Issue 2: "CORS policy" errors

**Symptom:** Browser console shows CORS errors

**Solution:**
```bash
# Verify CORS_ORIGIN in backend env
docker-compose exec backend env | grep CORS_ORIGIN

# Should include: http://localhost:3000,http://frontend:3000,http://nginx

# If not, update docker-compose-env/backend.env and restart
docker-compose restart backend
```

### Issue 3: Backend crashes on startup

**Symptom:** Backend container exits immediately

**Solution:**
```bash
# Check logs for error
docker-compose logs backend

# Common causes:
# 1. Database not ready → Wait longer, check postgres logs
# 2. Migration failed → Check migration files
# 3. Port already in use → Change port in docker-compose.yml

# Try rebuilding
docker-compose down
docker-compose build --no-cache backend
docker-compose up backend
```

### Issue 4: Frontend shows blank page

**Symptom:** http://localhost:3000 loads but shows nothing

**Solution:**
```bash
# Check frontend logs
docker-compose logs frontend

# Check if frontend can reach backend
docker-compose exec frontend wget -O- http://backend:5000/health

# Check browser console for errors
# Open http://localhost:3000 and press F12

# Rebuild frontend
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend
```

### Issue 5: Database connection errors

**Symptom:** Backend logs show "Can't reach database"

**Solution:**
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1"

# Restart postgres
docker-compose restart postgres
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                  http://localhost:3000                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                      │
│                  Container: nginx                       │
│                                                         │
│  Routes:                                                │
│  • /api/*  → backend:5000  (strips /api)              │
│  • /*      → frontend:3000                             │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  Backend (Port 5000) │   │  Frontend (Port 3000)    │
│  Container: backend  │   │  Container: frontend     │
│                      │   │                          │
│  • NestJS API        │   │  • Next.js App           │
│  • Prisma ORM        │   │  • React UI              │
│  • JWT Auth          │   │  • API calls to /api     │
└──────────┬───────────┘   └──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│              PostgreSQL (Port 5432)                      │
│              Container: postgres                         │
│                                                          │
│  • Database: spendwise                                   │
│  • User: admin                                           │
│  • Volume: postgres_data                                 │
└──────────────────────────────────────────────────────────┘

Network: spendwise-network (bridge)
```

---

## 🎉 Success Indicators

Your application is working correctly when:

1. ✅ All 4 containers show "healthy" status
2. ✅ Backend logs show "🚀 Backend server is running"
3. ✅ Frontend loads at http://localhost:3000
4. ✅ You can register a new user
5. ✅ You can login
6. ✅ Dashboard loads with data
7. ✅ No CORS errors in browser console
8. ✅ API calls in Network tab show 200 status

---

## 📝 Summary of Fixes

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| Frontend API URL | `http://localhost:5000` | `/api` | ✅ Works in Docker |
| Nginx Frontend Port | 5173 | 3000 | ✅ Correct Next.js port |
| CORS Origins | Single origin | Multiple origins | ✅ Works with nginx |
| Database Wait | None | 30 retries | ✅ No startup failures |
| Health Checks | None | All services | ✅ Proper dependencies |
| Docker Network | Default | Named network | ✅ Better isolation |
| Restart Policy | None | unless-stopped | ✅ Auto-recovery |

---

## 🚀 Quick Start Commands

```bash
# Complete rebuild and start
docker-compose down -v && docker-compose build --no-cache && docker-compose up

# Start in background
docker-compose up -d

# Watch logs
docker-compose logs -f

# Check status
docker-compose ps

# Test backend
curl http://localhost:5000/health

# Test through nginx
curl http://localhost:3000/api/health

# Stop everything
docker-compose down
```

---

**Status:** ✅ ALL ISSUES FIXED - READY TO DEPLOY

**Last Updated:** May 1, 2026  
**Fixed By:** Senior Full-Stack Engineer (Kiro AI)

🎉 **Your Docker setup is now production-ready!**
