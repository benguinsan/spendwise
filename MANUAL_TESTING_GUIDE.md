# HƯỚNG DẪN KIỂM THỬ THỦ CÔNG - SPENDWISE

**Ngày:** 30/04/2026  
**Phiên bản:** v0.2.0

---

## 🚀 CHUẨN BỊ

### 1. Khởi động Backend
```bash
cd backend
npm install
npm run start:dev
```
**Expected:** Backend chạy trên `http://localhost:5000`

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
**Expected:** Frontend chạy trên `http://localhost:5173`

### 3. Kiểm tra Database
- Đảm bảo PostgreSQL đang chạy
- Database đã được migrate
- Có thể kết nối được

---

## ✅ TEST CASES

### MODULE 1: AUTHENTICATION

#### Test 1.1: Signup Flow
**Steps:**
1. Mở `http://localhost:5173/signup`
2. Nhập email: `test@example.com`
3. Nhập name: `Test User`
4. Nhập password: `password123`
5. Nhập confirm password: `password123`
6. Click "Create account"

**Expected:**
- ✅ Hiển thị confirmation code form
- ✅ Email được gửi (check console/logs)
- ✅ Toast notification: "Check your email for confirmation code"

**Test Data:**
```
Email: test@example.com
Name: Test User
Password: password123
```

#### Test 1.2: Confirm Signup
**Steps:**
1. Nhập confirmation code từ email
2. Click "Confirm account"

**Expected:**
- ✅ Redirect to login page
- ✅ Toast: "Account confirmed! Please sign in."

#### Test 1.3: Login
**Steps:**
1. Mở `http://localhost:5173/login`
2. Nhập email: `test@example.com`
3. Nhập password: `password123`
4. Click "Sign in"

**Expected:**
- ✅ Redirect to `/dashboard`
- ✅ Toast: "Signed in successfully!"
- ✅ Header shows user email/name
- ✅ Navigation bar visible

#### Test 1.4: Protected Routes
**Steps:**
1. Logout
2. Try to access `http://localhost:5173/dashboard`

**Expected:**
- ✅ Redirect to `/login`
- ✅ Cannot access dashboard without login

#### Test 1.5: Logout
**Steps:**
1. Login
2. Click "Logout" button in header

**Expected:**
- ✅ Redirect to home page
- ✅ Token cleared from localStorage
- ✅ Cannot access dashboard anymore

---

### MODULE 2: DASHBOARD

#### Test 2.1: Dashboard Display
**Steps:**
1. Login and navigate to `/dashboard`

**Expected:**
- ✅ Welcome message with user name
- ✅ Total Balance card (shows $0.00 initially)
- ✅ Total Wallets count
- ✅ Total Transactions count
- ✅ Quick stats grid
- ✅ Recent transactions section (empty initially)
- ✅ Getting Started guide

#### Test 2.2: Dashboard with Data
**Steps:**
1. Create 2 wallets
2. Create 3 transactions
3. Return to dashboard

**Expected:**
- ✅ Total Balance updated
- ✅ Wallet count shows 2
- ✅ Transaction count shows 3
- ✅ Recent transactions table shows latest 5

---

### MODULE 3: WALLETS

#### Test 3.1: Create Wallet
**Steps:**
1. Navigate to `/dashboard/wallets`
2. Click "Add Wallet"
3. Enter name: "My Checking"
4. Enter currency: "USD"
5. Enter initial balance: "1000"
6. Click "Create Wallet"

**Expected:**
- ✅ Wallet appears in grid
- ✅ Shows name, balance, currency
- ✅ Toast: "Wallet created successfully!"
- ✅ Form closes

**Test Data:**
```
Wallet 1: My Checking, USD, $1000
Wallet 2: Savings Account, USD, $5000
Wallet 3: Cash Wallet, VND, 1000000
```

#### Test 3.2: Edit Wallet
**Steps:**
1. Click edit icon (✏️) on a wallet
2. Change name to "Updated Checking"
3. Change currency to "EUR"
4. Click "Update Wallet"

**Expected:**
- ✅ Wallet name updated in grid
- ✅ Currency updated
- ✅ Toast: "Wallet updated successfully!"
- ✅ Edit form closes
- ✅ Balance unchanged (note displayed)

#### Test 3.3: Delete Wallet
**Steps:**
1. Click delete icon (✕) on a wallet
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Wallet removed from grid
- ✅ Toast: "Wallet deleted successfully!"

#### Test 3.4: Empty State
**Steps:**
1. Delete all wallets

**Expected:**
- ✅ Empty state message displayed
- ✅ "Create Wallet" button in empty state
- ✅ No error

---

### MODULE 4: TRANSACTIONS

#### Test 4.1: Create Income Transaction
**Steps:**
1. Navigate to `/dashboard/transactions`
2. Click "Add Transaction"
3. Select type: "Income"
4. Enter amount: "500"
5. Select wallet: "My Checking"
6. Enter note: "Salary"
7. Select date: today
8. Click "Create Transaction"

**Expected:**
- ✅ Transaction appears in table
- ✅ Shows green color for income
- ✅ Amount shows +$500.00
- ✅ Toast: "Transaction created successfully!"

**Test Data:**
```
Income 1: $500, My Checking, "Salary"
Income 2: $200, Savings, "Freelance"
Expense 1: $50, My Checking, "Groceries"
Expense 2: $30, Cash Wallet, "Coffee"
Transfer 1: $100, My Checking → Savings
```

#### Test 4.2: Create Expense Transaction
**Steps:**
1. Click "Add Transaction"
2. Select type: "Expense"
3. Enter amount: "50"
4. Select wallet
5. Enter note: "Groceries"
6. Click "Create Transaction"

**Expected:**
- ✅ Transaction appears in table
- ✅ Shows red color for expense
- ✅ Amount shows -$50.00
- ✅ Toast: "Transaction created successfully!"

#### Test 4.3: Filter Transactions
**Steps:**
1. Create multiple transactions (income, expense, transfer)
2. Click "Income" filter button
3. Click "Expense" filter button
4. Click "Transfer" filter button
5. Click "All" filter button

**Expected:**
- ✅ Income filter shows only income transactions
- ✅ Expense filter shows only expense transactions
- ✅ Transfer filter shows only transfer transactions
- ✅ All filter shows all transactions
- ✅ Filter buttons highlight when active

#### Test 4.4: Delete Transaction
**Steps:**
1. Click "Delete" on a transaction
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Transaction removed from table
- ✅ Toast: "Transaction deleted successfully!"

#### Test 4.5: Empty State
**Steps:**
1. Delete all transactions

**Expected:**
- ✅ Empty state message displayed
- ✅ Message changes based on filter
- ✅ No error

---

### MODULE 5: CATEGORIES

#### Test 5.1: Create Category
**Steps:**
1. Navigate to `/dashboard/categories`
2. Click "Add Category"
3. Enter name: "Food"
4. Select type: "Expense"
5. Enter icon: "🍔"
6. Click "Create Category"

**Expected:**
- ✅ Category appears in grid
- ✅ Shows icon, name, type
- ✅ Toast: "Category created successfully!"

**Test Data:**
```
Expense Categories:
- Food 🍔
- Transport 🚗
- Shopping 🛒
- Bills 💡

Income Categories:
- Salary 💰
- Freelance 💻
- Investment 📈
```

#### Test 5.2: Edit Category
**Steps:**
1. Click edit icon (✏️) on a category
2. Change name to "Food & Drinks"
3. Change icon to "🍕"
4. Click "Update Category"

**Expected:**
- ✅ Category updated in grid
- ✅ Toast: "Category updated successfully!"
- ✅ Edit form closes

#### Test 5.3: Filter by Type
**Steps:**
1. Create both income and expense categories
2. Click "Income" filter
3. Click "Expense" filter
4. Click "All" filter

**Expected:**
- ✅ Filters work correctly
- ✅ Only matching categories shown
- ✅ Filter buttons highlight when active

#### Test 5.4: Delete Category
**Steps:**
1. Click delete icon (✕) on a category
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Category removed from grid
- ✅ Toast: "Category deleted successfully!"

---

### MODULE 6: BUDGETS

#### Test 6.1: Create Budget
**Steps:**
1. Navigate to `/dashboard/budgets`
2. Click "Add Budget"
3. Enter amount: "1000"
4. Select month: "5" (May)
5. Enter year: "2026"
6. Click "Create Budget"

**Expected:**
- ✅ Budget appears in table
- ✅ Shows period (May 2026)
- ✅ Shows amount ($1000.00)
- ✅ Toast: "Budget created successfully!"

**Test Data:**
```
Budget 1: $1000, May 2026
Budget 2: $1500, June 2026
Budget 3: $2000, July 2026
```

#### Test 6.2: Delete Budget
**Steps:**
1. Click "Delete" on a budget
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Budget removed from table
- ✅ Toast: "Budget deleted successfully!"

#### Test 6.3: Empty State
**Steps:**
1. Delete all budgets

**Expected:**
- ✅ Empty state message displayed
- ✅ "Create Budget" button in empty state

---

### MODULE 7: GOALS

#### Test 7.1: Create Goal
**Steps:**
1. Navigate to `/dashboard/goals`
2. Click "Add Goal"
3. Enter name: "Emergency Fund"
4. Enter description: "6 months expenses"
5. Enter target: "10000"
6. Select deadline: future date
7. Click "Create Goal"

**Expected:**
- ✅ Goal appears in grid
- ✅ Shows name, description
- ✅ Shows progress bar (0%)
- ✅ Shows target amount
- ✅ Shows days left
- ✅ Toast: "Goal created successfully!"

**Test Data:**
```
Goal 1: Emergency Fund, $10000, 6 months from now
Goal 2: Vacation, $5000, 3 months from now
Goal 3: New Laptop, $2000, 1 month from now
```

#### Test 7.2: Add Progress
**Steps:**
1. Click "Add $100 progress" button on a goal

**Expected:**
- ✅ Progress bar updates
- ✅ Current amount increases by $100
- ✅ Percentage updates
- ✅ Toast: "Progress updated successfully!"

#### Test 7.3: Complete Goal
**Steps:**
1. Add progress until goal reaches 100%

**Expected:**
- ✅ Progress bar shows 100%
- ✅ "Add progress" button disappears
- ✅ Visual indication of completion

#### Test 7.4: Delete Goal
**Steps:**
1. Click delete icon (✕) on a goal
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Goal removed from grid
- ✅ Toast: "Goal deleted successfully!"

---

### MODULE 8: TAGS

#### Test 8.1: Create Tag
**Steps:**
1. Navigate to `/dashboard/tags`
2. Click "Add Tag"
3. Enter name: "Work"
4. Click "Create Tag"

**Expected:**
- ✅ Tag appears in grid
- ✅ Shows tag icon 🏷️
- ✅ Shows tag name
- ✅ Toast: "Tag created successfully!"

**Test Data:**
```
Tags:
- Work
- Personal
- Travel
- Shopping
- Health
```

#### Test 8.2: Edit Tag
**Steps:**
1. Click edit icon (✏️) on a tag
2. Change name to "Work Projects"
3. Click "Update Tag"

**Expected:**
- ✅ Tag name updated in grid
- ✅ Toast: "Tag updated successfully!"
- ✅ Edit form closes

#### Test 8.3: Delete Tag
**Steps:**
1. Click delete icon (✕) on a tag
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Tag removed from grid
- ✅ Toast: "Tag deleted successfully!"

---

### MODULE 9: NOTIFICATIONS

#### Test 9.1: View Notifications
**Steps:**
1. Navigate to `/dashboard/notifications`

**Expected:**
- ✅ Page loads without error
- ✅ Shows notification list (may be empty)
- ✅ Shows unread count
- ✅ Filter buttons visible

**Note:** Notifications are typically created by backend events. For testing, you may need to create them via API or backend triggers.

#### Test 9.2: Filter Notifications
**Steps:**
1. Click "All" filter
2. Click "Unread" filter
3. Click "Read" filter

**Expected:**
- ✅ Filters work correctly
- ✅ Count updates in filter buttons
- ✅ Only matching notifications shown

#### Test 9.3: Mark as Read
**Steps:**
1. Click "Mark read" on an unread notification

**Expected:**
- ✅ Notification marked as read
- ✅ Visual style changes (opacity)
- ✅ Unread count decreases
- ✅ Toast: "Notification marked as read"

#### Test 9.4: Mark All as Read
**Steps:**
1. Click "Mark all as read" button

**Expected:**
- ✅ All notifications marked as read
- ✅ Unread count becomes 0
- ✅ Toast: "All notifications marked as read"

#### Test 9.5: Delete Notification
**Steps:**
1. Click delete icon (✕) on a notification
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Notification removed
- ✅ Toast: "Notification deleted"

#### Test 9.6: Delete All Notifications
**Steps:**
1. Click "Delete all" button
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ All notifications removed
- ✅ Empty state displayed
- ✅ Toast: "All notifications deleted"

---

### MODULE 10: RECURRING TRANSACTIONS

#### Test 10.1: Create Recurring Transaction
**Steps:**
1. Navigate to `/dashboard/recurring`
2. Click "Add Recurring Transaction"
3. Select type: "Expense"
4. Enter amount: "50"
5. Select interval: "Monthly"
6. Select next date: first day of next month
7. Select wallet
8. Enter note: "Netflix subscription"
9. Click "Create Recurring Transaction"

**Expected:**
- ✅ Recurring transaction appears in table
- ✅ Shows all details correctly
- ✅ Status shows "Active" (green)
- ✅ Toast: "Recurring transaction created successfully!"

**Test Data:**
```
Recurring Expenses:
- Netflix, $50, Monthly
- Gym, $30, Monthly
- Phone Bill, $20, Monthly

Recurring Income:
- Salary, $3000, Monthly
- Rent Income, $500, Monthly
```

#### Test 10.2: Edit Recurring Transaction
**Steps:**
1. Click edit icon (✏️) on a recurring transaction
2. Change amount to "55"
3. Change note to "Netflix Premium"
4. Click "Update Recurring Transaction"

**Expected:**
- ✅ Transaction updated in table
- ✅ Toast: "Recurring transaction updated successfully!"
- ✅ Edit form closes

#### Test 10.3: Toggle Active/Inactive
**Steps:**
1. Click "Active" status button on a transaction
2. Click "Inactive" status button to reactivate

**Expected:**
- ✅ Status changes to "Inactive" (gray)
- ✅ Row opacity changes
- ✅ Toast: "Recurring transaction deactivated"
- ✅ Can reactivate with same button
- ✅ Toast: "Recurring transaction activated"

#### Test 10.4: Delete Recurring Transaction
**Steps:**
1. Click delete icon (✕) on a recurring transaction
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Transaction removed from table
- ✅ Toast: "Recurring transaction deleted successfully!"

---

## 🔄 INTEGRATION TESTS

### Integration 1: Complete User Flow
**Scenario:** New user signs up and manages finances

**Steps:**
1. Signup → Confirm → Login
2. Create 2 wallets
3. Create 5 transactions
4. Create 3 categories
5. Create 2 budgets
6. Create 1 goal
7. Add progress to goal
8. Create 3 tags
9. Create 2 recurring transactions
10. Check dashboard shows all data

**Expected:**
- ✅ All operations succeed
- ✅ Dashboard reflects all data
- ✅ No errors in console
- ✅ All toasts appear correctly

### Integration 2: Data Consistency
**Scenario:** Verify data consistency across modules

**Steps:**
1. Create wallet with $1000 balance
2. Create income transaction +$500
3. Create expense transaction -$200
4. Check dashboard total balance
5. Check wallet balance

**Expected:**
- ✅ Dashboard shows correct total
- ✅ Wallet balance updated correctly
- ✅ Transaction list shows both transactions

### Integration 3: Navigation Flow
**Scenario:** Test navigation between all pages

**Steps:**
1. Login
2. Navigate to each module via header nav
3. Perform one action in each module
4. Return to dashboard

**Expected:**
- ✅ All navigation links work
- ✅ Active page highlighted
- ✅ No broken links
- ✅ Smooth transitions

---

## 🐛 ERROR HANDLING TESTS

### Error 1: Invalid Login
**Steps:**
1. Try to login with wrong password

**Expected:**
- ✅ Error toast displayed
- ✅ Form shows error message
- ✅ No redirect
- ✅ Can retry

### Error 2: Network Error
**Steps:**
1. Stop backend server
2. Try to create a wallet

**Expected:**
- ✅ Error toast displayed
- ✅ Form doesn't close
- ✅ Data not lost
- ✅ Can retry after backend restart

### Error 3: Validation Errors
**Steps:**
1. Try to create wallet with empty name
2. Try to create transaction with negative amount
3. Try to create budget with invalid month

**Expected:**
- ✅ Validation errors shown
- ✅ Form highlights invalid fields
- ✅ Cannot submit until fixed

---

## 📱 RESPONSIVE DESIGN TESTS

### Test on Different Screen Sizes:
1. **Desktop (1920x1080)**
   - ✅ Full layout visible
   - ✅ Navigation horizontal
   - ✅ Grid layouts work

2. **Tablet (768x1024)**
   - ✅ Layout adapts
   - ✅ Navigation scrollable
   - ✅ Grid becomes 2 columns

3. **Mobile (375x667)**
   - ✅ Layout stacks vertically
   - ✅ Navigation scrollable
   - ✅ Grid becomes 1 column
   - ✅ Forms full width

---

## 🎨 UI/UX TESTS

### Visual Tests:
- ✅ Loading states show skeleton/spinner
- ✅ Empty states show helpful messages
- ✅ Hover effects work on buttons
- ✅ Active states visible
- ✅ Colors consistent across pages
- ✅ Icons display correctly
- ✅ Typography readable

### Interaction Tests:
- ✅ Buttons respond to clicks
- ✅ Forms validate on submit
- ✅ Toasts auto-dismiss after 3-5 seconds
- ✅ Confirmations prevent accidental deletes
- ✅ Edit forms can be cancelled
- ✅ Loading states prevent double-submit

---

## 🔒 SECURITY TESTS

### Security 1: Protected Routes
**Steps:**
1. Logout
2. Try to access each dashboard page directly

**Expected:**
- ✅ All redirect to login
- ✅ No data visible without auth

### Security 2: Token Expiration
**Steps:**
1. Login
2. Manually delete token from localStorage
3. Try to perform any action

**Expected:**
- ✅ Redirect to login
- ✅ Error message shown

### Security 3: User Data Isolation
**Steps:**
1. Login as User A
2. Create some data
3. Logout and login as User B
4. Check if User B can see User A's data

**Expected:**
- ✅ User B cannot see User A's data
- ✅ Each user sees only their own data

---

## ✅ CHECKLIST TỔNG KẾT

### Core Functionality:
- [ ] Authentication works (signup, login, logout)
- [ ] Dashboard displays correctly
- [ ] Wallets CRUD works
- [ ] Transactions CRUD works (except edit)
- [ ] Categories CRUD works
- [ ] Budgets CRUD works (except edit)
- [ ] Tags CRUD works
- [ ] Goals CRUD works (except edit)
- [ ] Notifications works
- [ ] Recurring Transactions CRUD works

### UI/UX:
- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Loading states display
- [ ] Empty states display
- [ ] Toast notifications work
- [ ] Forms validate correctly
- [ ] Responsive on mobile/tablet

### Integration:
- [ ] Data flows between modules
- [ ] Dashboard reflects all data
- [ ] API calls succeed
- [ ] Error handling works

### Security:
- [ ] Protected routes work
- [ ] User data isolated
- [ ] Tokens managed correctly

---

## 📝 BUG REPORT TEMPLATE

Nếu phát hiện lỗi, ghi lại theo format:

```
**Bug ID:** BUG-001
**Module:** Transactions
**Severity:** High
**Description:** Cannot edit transaction
**Steps to Reproduce:**
1. Go to transactions page
2. Try to click edit button
3. No edit button exists

**Expected:** Edit button should be visible
**Actual:** No edit button
**Screenshot:** [attach if possible]
**Browser:** Chrome 120
**Date Found:** 2026-04-30
```

---

**Tester:** _______________  
**Date:** _______________  
**Status:** _______________
