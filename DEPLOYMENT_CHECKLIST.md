# DEPLOYMENT CHECKLIST - SPENDWISE

**Version:** v0.2.0  
**Date:** April 30, 2026  
**Status:** Ready for Beta Testing

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Code Quality
- [x] All TypeScript errors fixed
- [x] ESLint warnings reviewed
- [x] Code formatted consistently
- [x] No console.errors in production code
- [x] All imports resolved

### 2. Build Verification
- [ ] Backend builds successfully
  ```bash
  cd backend
  npm run build
  ```
- [ ] Frontend builds successfully
  ```bash
  cd frontend
  npm run build
  ```
- [ ] No TypeScript errors
- [ ] No build warnings (critical)

### 3. Environment Setup
- [ ] `.env` files configured
  - [ ] Backend `.env`
  - [ ] Frontend `.env.local`
- [ ] Database connection string set
- [ ] AWS Cognito credentials configured
- [ ] API URL configured in frontend
- [ ] CORS settings configured

### 4. Database
- [ ] PostgreSQL running
- [ ] Database created
- [ ] Migrations executed
  ```bash
  cd backend
  npx prisma migrate deploy
  ```
- [ ] Seed data (optional)

### 5. Security
- [x] JWT secrets configured
- [x] Protected routes implemented
- [x] User data isolation verified
- [x] CORS properly configured
- [ ] HTTPS enabled (production)
- [ ] Security headers set

### 6. Testing
- [ ] Manual testing completed
- [ ] API endpoints tested
- [ ] Authentication flow tested
- [ ] All CRUD operations tested
- [ ] Error handling tested
- [ ] Responsive design tested

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Backend Deployment

#### 1.1 Build Backend
```bash
cd backend
npm install
npm run build
```
**Expected:** Build succeeds, `dist/` folder created

#### 1.2 Run Migrations
```bash
npx prisma migrate deploy
```
**Expected:** All migrations applied successfully

#### 1.3 Start Backend
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```
**Expected:** Backend running on configured port (default: 5000)

#### 1.4 Verify Backend
```bash
curl http://localhost:5000/health
```
**Expected:** 200 OK response

---

### Step 2: Frontend Deployment

#### 2.1 Configure Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### 2.2 Build Frontend
```bash
npm install
npm run build
```
**Expected:** Build succeeds, `.next/` folder created

#### 2.3 Start Frontend
```bash
# Development
npm run dev

# Production
npm run start
```
**Expected:** Frontend running on configured port (default: 5173)

#### 2.4 Verify Frontend
Open browser: `http://localhost:5173`
**Expected:** Login page loads without errors

---

## 🧪 POST-DEPLOYMENT TESTING

### Critical Path Testing

#### Test 1: Authentication
- [ ] Can signup new user
- [ ] Can confirm signup (if required)
- [ ] Can login
- [ ] Can logout
- [ ] Protected routes redirect to login

#### Test 2: Dashboard
- [ ] Dashboard loads
- [ ] Shows correct user name
- [ ] Shows total balance
- [ ] Shows wallet count
- [ ] Shows transaction count

#### Test 3: Wallets
- [ ] Can create wallet
- [ ] Can edit wallet
- [ ] Can delete wallet
- [ ] Wallet list displays correctly

#### Test 4: Transactions
- [ ] Can create income transaction
- [ ] Can create expense transaction
- [ ] Can create transfer transaction
- [ ] Can delete transaction
- [ ] Filters work correctly

#### Test 5: Categories
- [ ] Can create category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Filters work correctly

#### Test 6: Budgets
- [ ] Can create budget
- [ ] Can delete budget
- [ ] Budget list displays correctly

#### Test 7: Tags
- [ ] Can create tag
- [ ] Can edit tag
- [ ] Can delete tag
- [ ] Tag list displays correctly

#### Test 8: Goals
- [ ] Can create goal
- [ ] Can add progress
- [ ] Can delete goal
- [ ] Progress bar updates

#### Test 9: Notifications
- [ ] Notifications list displays
- [ ] Can mark as read
- [ ] Can delete notification
- [ ] Filters work correctly

#### Test 10: Recurring Transactions
- [ ] Can create recurring transaction
- [ ] Can edit recurring transaction
- [ ] Can toggle active/inactive
- [ ] Can delete recurring transaction

---

## 🔍 SMOKE TESTS

### Quick Verification (5 minutes)

1. **Login Test**
   - [ ] Can access login page
   - [ ] Can login with test credentials
   - [ ] Redirects to dashboard

2. **Navigation Test**
   - [ ] All nav links work
   - [ ] No 404 errors
   - [ ] Active page highlighted

3. **Create Test**
   - [ ] Can create one item in each module
   - [ ] Toast notifications appear
   - [ ] Items appear in lists

4. **Error Test**
   - [ ] Invalid login shows error
   - [ ] Network error handled gracefully
   - [ ] Validation errors display

5. **Responsive Test**
   - [ ] Works on desktop
   - [ ] Works on tablet
   - [ ] Works on mobile

---

## 📊 PERFORMANCE CHECKS

### Frontend Performance
- [ ] Initial page load < 3 seconds
- [ ] Navigation transitions smooth
- [ ] No layout shifts
- [ ] Images optimized
- [ ] No memory leaks

### Backend Performance
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Connection pooling configured

### Network
- [ ] API calls minimized
- [ ] Data properly cached
- [ ] No unnecessary requests
- [ ] Proper error retry logic

---

## 🐛 KNOWN ISSUES

### Critical (Must Fix)
- None currently

### High Priority (Should Fix)
- [ ] No edit for Transactions
- [ ] No edit for Budgets
- [ ] No edit for Goals
- [ ] No category/tags in transaction form

### Medium Priority (Nice to Have)
- [ ] No pagination
- [ ] No search functionality
- [ ] No date range filters
- [ ] No budget tracking display

### Low Priority (Future)
- [ ] No charts/analytics
- [ ] No export functionality
- [ ] No forgot password
- [ ] No refresh token logic

---

## 📝 ROLLBACK PLAN

### If Deployment Fails:

1. **Stop Services**
   ```bash
   # Stop frontend
   pkill -f "next"
   
   # Stop backend
   pkill -f "nest"
   ```

2. **Revert Database** (if needed)
   ```bash
   cd backend
   npx prisma migrate reset
   ```

3. **Restore Previous Version**
   ```bash
   git checkout previous-stable-tag
   ```

4. **Redeploy**
   - Follow deployment steps again
   - Verify with smoke tests

---

## ✅ DEPLOYMENT SIGN-OFF

### Development Team
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Build successful
- [ ] Documentation updated

**Signed:** ________________  
**Date:** ________________

### QA Team
- [ ] Manual testing completed
- [ ] API testing completed
- [ ] No critical bugs
- [ ] Ready for beta

**Signed:** ________________  
**Date:** ________________

### Product Owner
- [ ] Features approved
- [ ] Known issues accepted
- [ ] Ready for user testing

**Signed:** ________________  
**Date:** ________________

---

## 🎯 SUCCESS CRITERIA

### Beta Deployment Success:
- ✅ All services running
- ✅ No critical errors
- ✅ Authentication works
- ✅ All modules accessible
- ✅ Data persists correctly
- ✅ No data loss
- ✅ Performance acceptable

### Production Deployment Success:
- ✅ All beta criteria met
- ✅ All high priority issues fixed
- ✅ Performance optimized
- ✅ Security hardened
- ✅ Monitoring configured
- ✅ Backup strategy in place

---

## 📞 SUPPORT CONTACTS

### Technical Issues
- **Backend:** [Backend Team]
- **Frontend:** [Frontend Team]
- **Database:** [DBA Team]
- **DevOps:** [DevOps Team]

### Emergency Contacts
- **On-Call Engineer:** [Phone]
- **Team Lead:** [Phone]
- **Product Owner:** [Phone]

---

## 📈 MONITORING

### What to Monitor:

#### Application Health
- [ ] Backend uptime
- [ ] Frontend uptime
- [ ] Database connections
- [ ] API response times

#### User Activity
- [ ] Login success rate
- [ ] API error rate
- [ ] Page load times
- [ ] User actions per session

#### System Resources
- [ ] CPU usage
- [ ] Memory usage
- [ ] Disk space
- [ ] Network bandwidth

#### Errors
- [ ] Application errors
- [ ] Database errors
- [ ] Authentication failures
- [ ] API failures

---

## 🎉 POST-DEPLOYMENT

### After Successful Deployment:

1. **Announce**
   - [ ] Notify team
   - [ ] Update status page
   - [ ] Send user communication

2. **Monitor**
   - [ ] Watch logs for 1 hour
   - [ ] Check error rates
   - [ ] Verify user activity

3. **Document**
   - [ ] Update deployment log
   - [ ] Document any issues
   - [ ] Update runbook

4. **Celebrate**
   - [ ] Team acknowledgment
   - [ ] Lessons learned session
   - [ ] Plan next iteration

---

**Deployment Manager:** ________________  
**Date:** ________________  
**Status:** [ ] Success [ ] Failed [ ] Rolled Back

---

## 📋 QUICK REFERENCE

### Start Services
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### Stop Services
```bash
# Ctrl+C in each terminal
```

### Check Logs
```bash
# Backend logs
cd backend && npm run start:dev

# Frontend logs
cd frontend && npm run dev
```

### Database
```bash
# Connect to database
psql -U postgres -d spendwise

# Run migrations
cd backend && npx prisma migrate deploy

# Reset database (DANGER!)
cd backend && npx prisma migrate reset
```

---

**Version:** v0.2.0  
**Last Updated:** April 30, 2026  
**Status:** ✅ READY FOR BETA DEPLOYMENT
