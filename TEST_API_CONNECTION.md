# 🧪 API Connection Testing Guide

## Quick Tests

### 1. Test Backend Directly (from host machine)

```bash
# Test backend root endpoint
curl http://localhost:5000/

# Test categories endpoint
curl http://localhost:5000/categories/defaults

# Test with verbose output
curl -v http://localhost:5000/categories/defaults
```

### 2. Test Through Nginx (from host machine)

```bash
# Test nginx proxy to backend
curl http://localhost:3000/api/

# Test categories through nginx
curl http://localhost:3000/api/categories/defaults

# Test with verbose output
curl -v http://localhost:3000/api/categories/defaults
```

### 3. Test from Frontend Container

```bash
# Enter frontend container
docker-compose exec frontend sh

# Test backend from inside container
wget -O- http://backend:5000/

# Test categories
wget -O- http://backend:5000/categories/defaults

# Exit container
exit
```

### 4. Test from Browser

Open browser console (F12) and run:

```javascript
// Test API base URL
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

// Test fetch
fetch("/api/categories/defaults")
  .then((res) => res.json())
  .then((data) => console.log("✅ API Response:", data))
  .catch((err) => console.error("❌ API Error:", err));
```

## Expected Responses

### Backend Root Endpoint
```json
{
  "statusCode": 200,
  "data": "Hello World!",
  "timestamp": "2026-05-01T..."
}
```

### Categories Defaults
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "...",
      "name": "Food",
      "type": "EXPENSE",
      "icon": "🍔"
    },
    ...
  ],
  "timestamp": "2026-05-01T..."
}
```

## Common Issues & Solutions

### Issue 1: Connection Refused

**Symptom:**
```
curl: (7) Failed to connect to localhost port 5000: Connection refused
```

**Solution:**
```bash
# Check if backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Issue 2: CORS Error

**Symptom:**
```
Access to fetch at 'http://localhost:5000/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**
- Backend CORS is already configured
- Make sure you're accessing through nginx at http://localhost:3000
- Don't access backend directly from browser

### Issue 3: 404 Not Found

**Symptom:**
```json
{
  "statusCode": 404,
  "message": "Cannot GET /api/categories/defaults"
}
```

**Solution:**
- Check nginx configuration
- Nginx should strip `/api` prefix before forwarding to backend
- Backend endpoints don't have `/api` prefix

### Issue 4: Network Error in Browser

**Symptom:**
```
TypeError: Failed to fetch
```

**Solution:**
1. Check browser console for exact error
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. In Docker: should be `/api`
4. In local dev: should be `http://localhost:5000`

## Debugging Commands

### Check Environment Variables

```bash
# Frontend
docker-compose exec frontend env | grep NEXT_PUBLIC

# Backend
docker-compose exec backend env | grep -E "PORT|CORS|DATABASE"
```

### Check Network Connectivity

```bash
# From frontend to backend
docker-compose exec frontend ping -c 3 backend

# From frontend to postgres
docker-compose exec frontend ping -c 3 postgres
```

### Check Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Check Nginx Configuration

```bash
# View nginx config
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf

# Test nginx config
docker-compose exec nginx nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload
```

## Success Indicators

✅ Backend responds to `curl http://localhost:5000/`
✅ Nginx proxies correctly: `curl http://localhost:3000/api/`
✅ Categories endpoint works: `curl http://localhost:3000/api/categories/defaults`
✅ Frontend loads at http://localhost:3000
✅ No CORS errors in browser console
✅ API calls in Network tab show 200 status
✅ Data displays correctly in UI

## Automated Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

echo "🧪 Testing API Connection..."
echo ""

echo "1️⃣ Testing Backend Direct..."
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
    exit 1
fi

echo ""
echo "2️⃣ Testing Nginx Proxy..."
if curl -s http://localhost:3000/api/ > /dev/null; then
    echo "✅ Nginx proxy is working"
else
    echo "❌ Nginx proxy is not working"
    exit 1
fi

echo ""
echo "3️⃣ Testing Categories Endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/categories/defaults)
if echo "$RESPONSE" | grep -q "statusCode"; then
    echo "✅ Categories endpoint is working"
    echo "Response: $RESPONSE"
else
    echo "❌ Categories endpoint failed"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
```

Make it executable and run:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

**Last Updated:** May 1, 2026
