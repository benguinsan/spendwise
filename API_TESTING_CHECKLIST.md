# API TESTING CHECKLIST - BACKEND ENDPOINTS

**Backend URL:** `http://localhost:5000`  
**Date:** 30/04/2026

---

## 🔧 SETUP

### Prerequisites:
```bash
# 1. Start PostgreSQL
# 2. Run migrations
cd backend
npx prisma migrate dev

# 3. Start backend
npm run start:dev
```

### Test User:
```
Email: test@example.com
Password: password123
```

---

## 📋 API ENDPOINTS CHECKLIST

### ✅ AUTHENTICATION ENDPOINTS

#### POST /auth/register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```
**Expected:** 201, returns user and tokens (if auto-confirmed) or confirmation required

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in signup form

---

#### POST /auth/login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** 200, returns user and tokens

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in login form

---

#### POST /auth/confirm-signup
```bash
curl -X POST http://localhost:5000/auth/confirm-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "confirmationCode": "123456"
  }'
```
**Expected:** 200, returns confirmed user and tokens

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in signup confirmation

---

#### GET /auth/me
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns current user profile

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in auth context

---

#### GET /auth/cognito/me
```bash
curl -X GET http://localhost:5000/auth/cognito/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns Cognito user profile

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in user service

---

### ✅ WALLETS ENDPOINTS

#### GET /wallets
```bash
curl -X GET http://localhost:5000/wallets \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns array of all wallets

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ⚠️ Used but should use /wallets/user/:userId

---

#### GET /wallets/user/:userId
```bash
curl -X GET http://localhost:5000/wallets/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's wallets

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in wallets page

---

#### GET /wallets/:id
```bash
curl -X GET http://localhost:5000/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns wallet details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /wallets
```bash
curl -X POST http://localhost:5000/wallets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Checking",
    "balance": 1000,
    "currency": "USD",
    "userId": "USER_ID"
  }'
```
**Expected:** 201, returns created wallet

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in wallets page

---

#### PATCH /wallets/:id
```bash
curl -X PATCH http://localhost:5000/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Checking",
    "currency": "EUR"
  }'
```
**Expected:** 200, returns updated wallet

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in wallets edit

---

#### DELETE /wallets/:id
```bash
curl -X DELETE http://localhost:5000/wallets/WALLET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, wallet deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in wallets page

---

### ✅ TRANSACTIONS ENDPOINTS

#### GET /transactions
```bash
curl -X GET http://localhost:5000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns array of all transactions

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ⚠️ Used but should use /transactions/user/:userId

---

#### GET /transactions/user/:userId
```bash
curl -X GET http://localhost:5000/transactions/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's transactions

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in transactions page

---

#### GET /transactions/wallet/:walletId
```bash
curl -X GET http://localhost:5000/transactions/wallet/WALLET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns wallet's transactions

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /transactions/:id
```bash
curl -X GET http://localhost:5000/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns transaction details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /transactions
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "type": "income",
    "note": "Salary",
    "date": "2026-04-30",
    "userId": "USER_ID",
    "walletId": "WALLET_ID"
  }'
```
**Expected:** 201, returns created transaction

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in transactions page

---

#### PATCH /transactions/:id
```bash
curl -X PATCH http://localhost:5000/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 550,
    "note": "Updated Salary"
  }'
```
**Expected:** 200, returns updated transaction

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ❌ NOT USED - Need to add edit feature

---

#### DELETE /transactions/:id
```bash
curl -X DELETE http://localhost:5000/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, transaction deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in transactions page

---

### ✅ CATEGORIES ENDPOINTS

#### GET /categories
```bash
curl -X GET http://localhost:5000/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns array of categories

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in categories page

---

#### GET /categories/type/:type
```bash
curl -X GET http://localhost:5000/categories/type/expense \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns categories of specified type

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /categories/defaults
```bash
curl -X GET http://localhost:5000/categories/defaults \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns default categories

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ❌ NOT USED

---

#### GET /categories/:id
```bash
curl -X GET http://localhost:5000/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns category details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /categories
```bash
curl -X POST http://localhost:5000/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food",
    "type": "expense",
    "icon": "🍔",
    "userId": "USER_ID"
  }'
```
**Expected:** 201, returns created category

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in categories page

---

#### PATCH /categories/:id
```bash
curl -X PATCH http://localhost:5000/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food & Drinks",
    "icon": "🍕"
  }'
```
**Expected:** 200, returns updated category

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in categories edit

---

#### DELETE /categories/:id
```bash
curl -X DELETE http://localhost:5000/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, category deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in categories page

---

### ✅ BUDGETS ENDPOINTS

#### GET /budgets
```bash
curl -X GET http://localhost:5000/budgets \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns array of budgets

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ⚠️ Used but should use /budgets/user/:userId

---

#### GET /budgets/user/:userId
```bash
curl -X GET http://localhost:5000/budgets/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's budgets

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in budgets page

---

#### GET /budgets/:id
```bash
curl -X GET http://localhost:5000/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns budget details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /budgets
```bash
curl -X POST http://localhost:5000/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "month": 5,
    "year": 2026,
    "userId": "USER_ID"
  }'
```
**Expected:** 201, returns created budget

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in budgets page

---

#### PATCH /budgets/:id
```bash
curl -X PATCH http://localhost:5000/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500
  }'
```
**Expected:** 200, returns updated budget

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ❌ NOT USED - Need to add edit feature

---

#### DELETE /budgets/:id
```bash
curl -X DELETE http://localhost:5000/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, budget deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in budgets page

---

### ✅ TAGS ENDPOINTS

#### GET /tags
```bash
curl -X GET http://localhost:5000/tags \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns array of tags

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in tags page

---

#### GET /tags/:id
```bash
curl -X GET http://localhost:5000/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns tag details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /tags/:id/transactions
```bash
curl -X GET http://localhost:5000/tags/TAG_ID/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns transactions with this tag

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ❌ NOT USED

---

#### POST /tags
```bash
curl -X POST http://localhost:5000/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work",
    "userId": "USER_ID"
  }'
```
**Expected:** 201, returns created tag

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in tags page

---

#### PATCH /tags/:id
```bash
curl -X PATCH http://localhost:5000/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Projects"
  }'
```
**Expected:** 200, returns updated tag

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in tags edit

---

#### DELETE /tags/:id
```bash
curl -X DELETE http://localhost:5000/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, tag deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in tags page

---

### ✅ GOALS ENDPOINTS

#### GET /goals?userId=:userId
```bash
curl -X GET "http://localhost:5000/goals?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's goals

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /goals/summary/:userId
```bash
curl -X GET http://localhost:5000/goals/summary/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns goals summary

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in goals page

---

#### GET /goals/:id?userId=:userId
```bash
curl -X GET "http://localhost:5000/goals/GOAL_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns goal details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /goals
```bash
curl -X POST http://localhost:5000/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "description": "6 months expenses",
    "target": 10000,
    "current": 0,
    "deadline": "2026-12-31",
    "userId": "USER_ID"
  }'
```
**Expected:** 201, returns created goal

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in goals page

---

#### PATCH /goals/:id?userId=:userId
```bash
curl -X PATCH "http://localhost:5000/goals/GOAL_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Emergency Fund",
    "target": 15000
  }'
```
**Expected:** 200, returns updated goal

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ❌ NOT USED - Need to add edit feature

---

#### POST /goals/:id/progress?userId=:userId
```bash
curl -X POST "http://localhost:5000/goals/GOAL_ID/progress?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }'
```
**Expected:** 200, returns updated goal with new progress

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in goals page

---

#### DELETE /goals/:id?userId=:userId
```bash
curl -X DELETE "http://localhost:5000/goals/GOAL_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, goal deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in goals page

---

### ✅ NOTIFICATIONS ENDPOINTS

#### GET /notifications?userId=:userId
```bash
curl -X GET "http://localhost:5000/notifications?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's notifications

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in notifications page

---

#### GET /notifications/summary/:userId
```bash
curl -X GET http://localhost:5000/notifications/summary/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns notifications summary

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /notifications/:id?userId=:userId
```bash
curl -X GET "http://localhost:5000/notifications/NOTIFICATION_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns notification details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### PATCH /notifications/:id/read?userId=:userId
```bash
curl -X PATCH "http://localhost:5000/notifications/NOTIFICATION_ID/read?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, notification marked as read

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in notifications page

---

#### PATCH /notifications/batch/read-all?userId=:userId
```bash
curl -X PATCH "http://localhost:5000/notifications/batch/read-all?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, all notifications marked as read

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in notifications page

---

#### DELETE /notifications/:id?userId=:userId
```bash
curl -X DELETE "http://localhost:5000/notifications/NOTIFICATION_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, notification deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in notifications page

---

#### DELETE /notifications?userId=:userId
```bash
curl -X DELETE "http://localhost:5000/notifications?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, all notifications deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in notifications page

---

### ✅ RECURRING TRANSACTIONS ENDPOINTS

#### GET /recurring-transactions?userId=:userId
```bash
curl -X GET "http://localhost:5000/recurring-transactions?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns user's recurring transactions

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in recurring page

---

#### GET /recurring-transactions/:id?userId=:userId
```bash
curl -X GET "http://localhost:5000/recurring-transactions/RECURRING_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns recurring transaction details

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### GET /recurring-transactions/:id/next-executions?userId=:userId&count=5
```bash
curl -X GET "http://localhost:5000/recurring-transactions/RECURRING_ID/next-executions?userId=USER_ID&count=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, returns next 5 execution dates

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Available in service

---

#### POST /recurring-transactions
```bash
curl -X POST http://localhost:5000/recurring-transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "type": "EXPENSE",
    "interval": "MONTHLY",
    "nextDate": "2026-05-01",
    "note": "Netflix subscription",
    "isActive": true,
    "userId": "USER_ID",
    "walletId": "WALLET_ID"
  }'
```
**Expected:** 201, returns created recurring transaction

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in recurring page

---

#### PATCH /recurring-transactions/:id?userId=:userId
```bash
curl -X PATCH "http://localhost:5000/recurring-transactions/RECURRING_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55,
    "note": "Netflix Premium"
  }'
```
**Expected:** 200, returns updated recurring transaction

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in recurring edit

---

#### PATCH /recurring-transactions/:id/toggle?userId=:userId
```bash
curl -X PATCH "http://localhost:5000/recurring-transactions/RECURRING_ID/toggle?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```
**Expected:** 200, recurring transaction toggled

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in recurring page

---

#### DELETE /recurring-transactions/:id?userId=:userId
```bash
curl -X DELETE "http://localhost:5000/recurring-transactions/RECURRING_ID?userId=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200, recurring transaction deleted

**Status:** [ ] Pass [ ] Fail  
**Frontend Integration:** ✅ Used in recurring page

---

## 📊 SUMMARY

### Total Endpoints: ~60+

### By Status:
- ✅ **Fully Integrated:** ~45 endpoints (75%)
- ⚠️ **Partially Used:** ~5 endpoints (8%)
- ❌ **Not Used:** ~10 endpoints (17%)

### Missing Frontend Features:
1. ❌ Edit Transactions (PATCH /transactions/:id)
2. ❌ Edit Budgets (PATCH /budgets/:id)
3. ❌ Edit Goals (PATCH /goals/:id)
4. ❌ Get default categories (GET /categories/defaults)
5. ❌ Get tag transactions (GET /tags/:id/transactions)
6. ❌ Get next executions (GET /recurring-transactions/:id/next-executions)

### Security Issues Fixed:
- ✅ Dashboard now uses user-scoped endpoints

---

**Tester:** _______________  
**Date:** _______________  
**Backend Version:** _______________  
**All Tests Pass:** [ ] Yes [ ] No
