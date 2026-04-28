# Frontend Testing & Validation Guide

**Created**: April 23, 2026  
**Purpose**: Step-by-step guide to test and validate the SpendWise frontend with backend

---

## Pre-Testing Setup

### 1. Verify Development Environment

```bash
# Terminal 1: Check frontend dev server
curl http://localhost:5173/

# Terminal 2: Check backend API
curl http://localhost:5000/health
```

### 2. Frontend Environment Variables

Create `.env.local` in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Open Browser

Visit: http://localhost:5173

You should see the login page with SpendWise branding.

---

## Test Scenario 1: Registration & Login

### Preconditions
- [ ] Frontend is running on http://localhost:5173
- [ ] Backend is running on http://localhost:5000
- [ ] Database is clean (no existing users)

### Test Steps

#### 1.1 Register New Account
1. On login page, click "Sign up" link
2. Enter test data:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `testpass123`
   - Confirm: `testpass123`
3. Click "Sign Up" button
4. **Expected**: Redirected to dashboard, user logged in

#### 1.2 Verify User Created
```bash
# Check database
curl -X GET http://localhost:5000/users \
  -H "Authorization: Bearer <access_token>"
```

#### 1.3 Logout & Login Again
1. Click user menu (top right)
2. Click "Logout"
3. **Expected**: Redirected to login page, localStorage cleared
4. Login with same credentials
5. **Expected**: Successful login, tokens stored

### Success Criteria
- [ ] User registration successful
- [ ] User can login after registration
- [ ] Tokens are stored in browser localStorage
- [ ] Dashboard is accessible after login
- [ ] Logout clears auth state

---

## Test Scenario 2: Dashboard & Statistics

### Test Steps

#### 2.1 Dashboard Load
1. After login, verify dashboard displays
2. Check if 4 stat cards are visible:
   - Total Income
   - Total Expenses
   - Wallet Balance
   - Transactions

#### 2.2 Charts Rendering
1. Verify charts are displayed (if transactions exist)
2. Check "Income vs Expenses" bar chart
3. Check "Expenses by Category" pie chart

#### 2.3 Recent Transactions
1. Verify recent transactions list displays
2. Click on transaction actions
3. Verify pagination works

### Success Criteria
- [ ] All stat cards render with proper values
- [ ] Charts display correctly
- [ ] Navigation works
- [ ] No console errors

---

## Test Scenario 3: Transaction Management (CRUD)

### Test Steps

#### 3.1 Create Transaction
1. Click "Expenses" in sidebar
2. Click "Add Transaction" button
3. Fill form:
   - Amount: `500000`
   - Description: `Test transaction`
   - Wallet: Select from dropdown
   - Category: Select from dropdown
4. Click "Add" button
5. **Expected**: Transaction appears in table, notification shows

**Verify in Console**:
```javascript
// Check localStorage
localStorage.getItem('auth-storage')
// Should have valid tokens
```

#### 3.2 Read/List Transactions
1. On Expenses page, verify table displays transactions
2. Check pagination works
3. Verify transaction details are correct

**Check Network Tab** (F12 → Network):
- Request: `GET /transactions?userId=...&skip=0&take=10`
- Response: Should return transactions array

#### 3.3 Update Transaction
1. Click "Edit" button on transaction row
2. Modify amount to `750000`
3. Click "Update"
4. **Expected**: Transaction updates in table

**Check Network**:
- Request: `PATCH /transactions/{id}`
- Response: Updated transaction

#### 3.4 Delete Transaction
1. Click "Delete" button
2. Confirm action if prompted
3. **Expected**: Transaction removes from table

**Check Network**:
- Request: `DELETE /transactions/{id}`
- Response: 204 or success message

### Success Criteria
- [ ] Can add new transaction
- [ ] Can edit existing transaction  
- [ ] Can delete transaction
- [ ] Table updates correctly
- [ ] All API calls successful (check Network tab)
- [ ] No form validation errors

---

## Test Scenario 4: Protected Routes & Authentication

### Test Steps

#### 4.1 Test Route Protection
1. Clear browser localStorage
   ```javascript
   localStorage.clear()
   ```
2. Manually navigate to http://localhost:5173/dashboard
3. **Expected**: Redirected to /login

#### 4.2 Test Public Routes
1. After logout, verify can access /login and /register
2. Verify cannot access other routes

#### 4.3 Test Token Refresh (If Implemented)
1. Open DevTools → Console
2. Wait for token to expire (if short expiry set)
3. Click any action that requires API call
4. **Expected**: Automatic token refresh, action succeeds

### Success Criteria
- [ ] Cannot access protected routes without login
- [ ] Can only access public routes without auth
- [ ] Token refresh works (if implemented)
- [ ] Proper error messages shown

---

## Test Scenario 5: Form Validation

### Test Steps

#### 5.1 Login Form Validation
1. Try to login with empty fields
2. **Expected**: Error message "Please fill in all fields"
3. Try invalid email format
4. **Expected**: Email validation error
5. Try wrong password
6. **Expected**: "Invalid credentials" error

#### 5.2 Register Form Validation
1. Try to register with password mismatch
2. **Expected**: Error message
3. Try with existing email
4. **Expected**: "Email already registered" or similar
5. Try invalid data
6. **Expected**: Appropriate validation errors

#### 5.3 Transaction Form Validation
1. Try to submit without selecting wallet
2. **Expected**: "Please select a wallet"
3. Try negative amount
4. **Expected**: Error message
5. Try without amount
6. **Expected**: Error message

### Success Criteria
- [ ] All forms validate properly
- [ ] Error messages are clear
- [ ] Form prevents invalid submissions
- [ ] Validation happens before API call

---

## Test Scenario 6: Error Handling

### Test Steps

#### 6.1 Network Error
1. Stop backend server
2. Try to perform API action
3. **Expected**: Error message displayed, not crash

#### 6.2 Invalid Token
1. Manually modify localStorage token
2. Perform API action
3. **Expected**: Redirect to login or show error

#### 6.3 Server Error (500)
1. (Requires backend to return 500 for specific action)
2. Perform action that triggers error
3. **Expected**: Error displayed, app doesn't crash

### Success Criteria
- [ ] App handles network errors gracefully
- [ ] Error messages are user-friendly
- [ ] App doesn't crash on errors
- [ ] Proper redirects on auth failures

---

## Automated Testing Checklist

### Browser Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. **Expected**: No red errors after each action

### Network Requests
1. Open DevTools → Network tab
2. Perform actions
3. Check each request:
   - [ ] Status code is 200/201/204 (not 4xx/5xx)
   - [ ] Request headers include `Authorization: Bearer <token>`
   - [ ] Response is valid JSON
   - [ ] No CORS errors

### React DevTools (if installed)
1. Open React DevTools
2. Verify component hierarchy
3. Check props and state values
4. Verify no unnecessary re-renders

### Performance (F12 → Performance)
1. Click "Start recording"
2. Perform main action (e.g., add transaction)
3. Stop recording
4. **Expected**: Action completes in <1 second

---

## Manual Test Execution

### Quick Test (5 minutes)
```bash
# Start both servers
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm run dev

# Browser tests:
1. Register user
2. Login
3. View dashboard
4. Add transaction
5. Logout
```

### Full Test (30 minutes)
Run all test scenarios (1-6) from this guide

### Production Readiness Test (1 hour)
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run full test scenarios on production build
# Verify all tests pass
```

---

## Debugging Guide

### Issue: "Cannot find module @types"

**Solution**: Run type check
```bash
npm run type-check
```

If still failing:
1. Verify tsconfig.json has path aliases
2. Verify vite.config.ts has path aliases
3. Clear node_modules: `rm -rf node_modules && npm install`

### Issue: API calls failing with 401

**Solution**: 
1. Check if backend is running
2. Verify VITE_API_URL is correct
3. Check browser Network tab:
   - Look for request to `/auth/login`
   - Verify response has `accessToken`

### Issue: Tokens not stored

**Solution**:
1. Open DevTools → Console
2. Run: `localStorage.getItem('auth-storage')`
3. Should see stored tokens
4. If not, check Zustand store configuration

### Issue: Page blank/white

**Solution**:
1. Open DevTools Console (F12)
2. Look for red errors
3. Check Network tab for failed requests
4. Verify backend is running

---

## Performance Baseline

Record these measurements for future comparison:

| Metric | Expected | Actual |
|--------|----------|--------|
| Page Load Time | <2s | ___ |
| Dashboard Render | <1s | ___ |
| Add Transaction | <1s | ___ |
| Table Pagination | <500ms | ___ |

---

## Test Results Template

```markdown
# Test Execution Report

Date: ___________
Tester: _________
Environment: Backend @ localhost:5000, Frontend @ localhost:5173

## Scenario 1: Registration & Login
- [ ] Registration: PASS / FAIL
- [ ] Login: PASS / FAIL
- [ ] Tokens stored: PASS / FAIL
- [ ] Logout: PASS / FAIL

## Scenario 2: Dashboard
- [ ] Stats display: PASS / FAIL
- [ ] Charts render: PASS / FAIL
- [ ] Recent transactions: PASS / FAIL

## Scenario 3: Transaction CRUD
- [ ] Create: PASS / FAIL
- [ ] Read: PASS / FAIL
- [ ] Update: PASS / FAIL
- [ ] Delete: PASS / FAIL

## Scenario 4: Protected Routes
- [ ] Route protection: PASS / FAIL
- [ ] Public routes: PASS / FAIL
- [ ] Token refresh: PASS / FAIL

## Scenario 5: Form Validation
- [ ] Login validation: PASS / FAIL
- [ ] Register validation: PASS / FAIL
- [ ] Transaction validation: PASS / FAIL

## Scenario 6: Error Handling
- [ ] Network error: PASS / FAIL
- [ ] Invalid token: PASS / FAIL
- [ ] Server error: PASS / FAIL

## Overall Result: PASS / FAIL
Notes: ___________
```

---

## Browser DevTools Tips

### View API Responses
```javascript
// In Console, after making an API call:
// Look at Network tab → click request → Response tab
```

### Check Authentication State
```javascript
// In Console:
localStorage.getItem('auth-storage')
// Shows stored user, tokens, auth status
```

### Monitor State Changes
```javascript
// If using Zustand DevTools:
// Open Redux DevTools extension
// View state changes in real-time
```

### Test API Endpoints Directly
```bash
# In terminal, test auth endpoint:
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| **Login doesn't work** | Check backend is running, verify credentials |
| **Page is blank** | Check console for errors, verify API URL |
| **Transactions don't load** | Check Network tab, verify userId in params |
| **Form won't submit** | Check validation errors in console |
| **Table is empty** | Verify transactions exist in database |
| **Charts don't show** | Need at least one transaction to display |

---

## Success Criteria for Sign-Off

- [ ] All 6 test scenarios pass
- [ ] No console errors
- [ ] All API responses are successful
- [ ] Form validation works
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] No security issues

**Status**: Ready for → **PRODUCTION DEPLOYMENT**

