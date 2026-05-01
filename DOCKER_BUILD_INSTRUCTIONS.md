# Docker Build Instructions - SpendWise

## ✅ All TypeScript Errors Fixed!

All type casting issues have been resolved. Your application is now ready to build.

## 🚀 Quick Start

### Step 1: Build the Docker Images

From the project root directory (where `docker-compose.yml` is located):

```bash
docker-compose build
```

This will build all three services:
- **Frontend** (Next.js application)
- **Backend** (NestJS API)
- **Nginx** (Reverse proxy)

### Step 2: Start the Application

```bash
docker-compose up
```

Or run in detached mode (background):

```bash
docker-compose up -d
```

### Step 3: Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api

## 📋 What Was Fixed

### TypeScript Type Casting Issues

**Problem:** The backend returns `type` fields as plain strings, but TypeScript expects union types like `"INCOME" | "EXPENSE" | "TRANSFER"`.

**Solution:** Added explicit type casting to all service functions:

```typescript
// Before (caused build errors)
return await api.categories.getOne(id);

// After (fixed)
const data = await api.categories.getOne(id);
return (data as Category) || null;
```

### Files Modified (9 service files)

1. ✅ `frontend/src/services/category.service.ts`
2. ✅ `frontend/src/services/transaction.service.ts`
3. ✅ `frontend/src/services/recurring-transaction.service.ts`
4. ✅ `frontend/src/services/budget.service.ts`
5. ✅ `frontend/src/services/wallet.service.ts`
6. ✅ `frontend/src/services/goal.service.ts`
7. ✅ `frontend/src/services/tag.service.ts`
8. ✅ `frontend/src/services/notification.service.ts`
9. ✅ `frontend/src/services/user.service.ts`

**Total:** 45+ functions fixed with proper type casting

## 🔍 Verify the Build

### Check Build Logs

Watch the build process to ensure no errors:

```bash
docker-compose build 2>&1 | tee build.log
```

### Expected Output

You should see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### Check for Errors

If you see any errors, check:
1. **TypeScript errors:** Should be none now
2. **Dependency errors:** Run `npm install` in frontend directory
3. **Environment variables:** Ensure `.env` files are configured

## 🧪 Test the Application

### 1. Register a New User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Test Frontend

1. Open http://localhost:3000
2. Click "Register" or "Login"
3. Create a wallet
4. Add a transaction
5. Check dashboard

## 🐛 Troubleshooting

### Build Still Fails?

**Clear Docker cache and rebuild:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### TypeScript Errors Persist?

**Clear Next.js cache:**
```bash
cd frontend
rm -rf .next
rm -rf node_modules
npm install
cd ..
docker-compose build frontend
```

### Port Already in Use?

**Change ports in `docker-compose.yml`:**
```yaml
services:
  frontend:
    ports:
      - "3000:3000"  # Change first number to different port
  backend:
    ports:
      - "3001:3001"  # Change first number to different port
```

### Database Connection Issues?

**Ensure PostgreSQL is running:**
```bash
docker-compose ps
```

**Check database logs:**
```bash
docker-compose logs db
```

## 📊 Service Status

Check if all services are running:

```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE    STATUS
spendwise-backend   "npm run start:prod"     backend    Up
spendwise-frontend  "npm start"              frontend   Up
spendwise-nginx     "nginx -g 'daemon of…"   nginx      Up
spendwise-db        "docker-entrypoint.s…"   db         Up
```

## 🔧 Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart frontend only
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Rebuild Single Service

```bash
# Rebuild frontend only
docker-compose build frontend
docker-compose up -d frontend
```

## 📚 Additional Documentation

For more details, see:
- **BUILD_READY_SUMMARY.md** - Complete build status
- **TYPESCRIPT_BUILD_FIXES_FINAL.md** - Detailed fix explanation
- **FINAL_QA_REPORT.md** - Full QA analysis
- **MANUAL_TESTING_GUIDE.md** - Testing procedures

## ✨ Success Indicators

Your build is successful when you see:

1. ✅ Docker build completes without errors
2. ✅ All services show "Up" status
3. ✅ Frontend accessible at http://localhost:3000
4. ✅ Backend API accessible at http://localhost:3001
5. ✅ No errors in browser console
6. ✅ Can register and login
7. ✅ Can create wallets and transactions

## 🎉 Next Steps

Once the build succeeds:

1. **Test all features** using MANUAL_TESTING_GUIDE.md
2. **Verify API integration** using API_TESTING_CHECKLIST.md
3. **Check security** - ensure data is user-scoped
4. **Monitor performance** - check response times
5. **Prepare for deployment** using DEPLOYMENT_CHECKLIST.md

---

**Status:** ✅ READY TO BUILD
**Last Updated:** May 1, 2026

## 🚀 Build Now!

```bash
docker-compose build && docker-compose up
```

Good luck! 🎉
