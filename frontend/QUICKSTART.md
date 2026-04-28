# Quick Start Guide - SpendWise Frontend

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Backend running on http://localhost:5000
- npm or yarn package manager

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Create Environment File
```bash
cp .env.example .env.local
```

Verify `.env.local` contains:
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open browser: http://localhost:5173

### Step 4: Test Login
Use these test credentials:
```
Email: test@example.com
Password: password123
```

**Note**: First create an account via Register page if needed

## 📋 What's Included

### Authentication (✅ Complete)
- Login page with form validation
- Register page with password confirmation
- JWT token management with auto-refresh
- Persistent login (localStorage)
- Protected routes

### Dashboard (✅ Complete)
- Summary cards (Income, Expenses, Balance, Transactions)
- Income vs Expenses chart (Bar Chart)
- Expenses by Category pie chart
- Recent transactions list
- Quick action buttons

### Transactions (✅ Complete)
- Full CRUD operations
- Pagination support
- Table view with all details
- Add/Edit/Delete modals
- Category and wallet selection

### Pages (⚠️ Placeholder)
- Categories
- Wallets
- Budgets
- Goals
- Reports

These pages have placeholder layouts ready for implementation.

## 🔧 Architecture Overview

```
Request Flow:
┌─────────────────────────────────────┐
│  React Component (useTransactions)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  React Query Hook (useQuery/useMutation)
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  API Service (transactionsApi)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Axios Instance (with interceptors) │
│  - JWT token injection              │
│  - Token refresh on 401             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Backend API (NestJS)               │
└─────────────────────────────────────┘
```

## 📁 Key Files to Know

```
frontend/
├── src/
│   ├── main.tsx              ← Application entry point
│   ├── App.tsx               ← Routing setup
│   ├── config/api.ts         ← Axios configuration with interceptors
│   ├── stores/auth.store.ts  ← Authentication state (Zustand)
│   ├── hooks/                ← React Query hooks
│   ├── api/                  ← API service layer
│   ├── types/index.ts        ← All TypeScript types
│   ├── pages/                ← Page components
│   ├── components/           ← Reusable UI components
│   └── layouts/              ← Layout wrappers
├── .env.example              ← Environment template
├── vite.config.ts            ← Vite configuration
└── tsconfig.json             ← TypeScript configuration
```

## 🔐 Authentication Details

### How JWT Token Refresh Works

1. User logs in → receives `accessToken` and `refreshToken`
2. Each API request includes `Authorization: Bearer <accessToken>`
3. If API returns 401 (token expired):
   - Automatically call `/auth/refresh` with `refreshToken`
   - Get new `accessToken`
   - Retry original request
   - If refresh fails → logout and redirect to /login

### Token Storage

- Stored in Zustand store (in-memory)
- Persisted to `localStorage` under key: `auth-storage`
- Retrieved on app startup for session persistence

## 🛠️ Common Development Tasks

### Add a New Page

1. Create file: `src/pages/my-feature/MyFeaturePage.tsx`
2. Export component
3. Add route in `src/App.tsx`
4. Add navigation item in `src/layouts/MainLayout.tsx`

### Add a New API Service

1. Create: `src/api/my-feature.api.ts`
2. Implement CRUD functions using `apiClient`
3. Export in `src/api/index.ts`

### Add React Query Hook

1. Create: `src/hooks/useMyFeature.ts`
2. Use `useQuery` or `useMutation` from `@tanstack/react-query`
3. Export in `src/hooks/index.ts`

### Format Values

```typescript
import { formatCurrency, formatDate, formatNumber } from '@utils/formatters'

formatCurrency(1000000)  // "1,000,000"
formatDate("2026-04-23") // "Apr 23, 2026"
formatNumber(1000, 2)    // "1,000.00"
```

## 🐛 Debugging

### Enable Network Requests Logging

Add to `src/config/api.ts`:

```typescript
instance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response)
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

### Check Zustand Store

```typescript
import { useAuthStore } from '@stores/auth.store'

// In browser console:
useAuthStore.getState()
```

### React Query DevTools

The app includes React Query for state management. Open browser dev tools to inspect queries/mutations.

## 📊 Example: Creating a Transaction

### 1. In Component
```typescript
const { mutate: createTx } = useCreateTransaction()

const handleSubmit = (data) => {
  createTx({
    userId: user.id,
    amount: 500000,
    type: 'EXPENSE',
    note: 'Lunch',
    walletId: wallet.id,
    categoryId: category.id,
    date: new Date().toISOString(),
  })
}
```

### 2. Hook processes mutation
```typescript
export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: (data) => transactionsApi.create(data),
  })
}
```

### 3. API service calls backend
```typescript
export const transactionsApi = {
  create: async (data) => {
    const response = await apiClient.post('/transactions', data)
    return response.data
  },
}
```

### 4. Request includes JWT token (automatic)
```
POST /transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
{
  "userId": "...",
  "amount": 500000,
  ...
}
```

## ✅ Testing Checklist

- [ ] Login works
- [ ] Can see dashboard with data
- [ ] Can add a transaction
- [ ] Can edit a transaction
- [ ] Can delete a transaction
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Forms validate input
- [ ] Charts display correctly
- [ ] Tables paginate
- [ ] Error messages show

## 📱 Responsive Design

The app is responsive and works on:
- Desktop (1920px+)
- Tablet (768px+)
- Mobile (320px+)

Test by resizing browser or using Chrome DevTools device emulation.

## 🚀 Build for Production

```bash
npm run build
npm run preview
```

Deploy `dist/` folder to your hosting service.

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run type-check
```

### Backend API not connecting
- Check `VITE_API_URL` in `.env.local`
- Ensure backend is running on http://localhost:5000
- Check browser console for CORS errors

### Login fails
- Verify backend is running
- Check email and password
- Look at browser Network tab for error details

### Blank dashboard
- Check if transactions exist in backend
- Look at browser console for JavaScript errors
- Verify backend API endpoints are working (use Postman)

### Token refresh not working
- Check refresh endpoint in backend: `/auth/refresh`
- Verify refresh token is valid
- Check localStorage for auth-storage

## 📖 Next Steps

1. **Implement remaining pages** (Categories, Wallets, Budgets, Goals, Reports)
2. **Add more features** (Tags, Recurring Transactions, Notifications)
3. **Improve UX** (Loading states, animations, notifications)
4. **Add validation** (Form validation, input sanitization)
5. **Write tests** (Unit tests, integration tests, e2e tests)
6. **Deploy** (GitHub Pages, Vercel, Netlify, custom server)

## 📞 Support Resources

- **API Docs**: See `spendwise-postman-collection.json`
- **MUI Docs**: https://mui.com
- **React Query**: https://tanstack.com/query
- **Vite**: https://vitejs.dev
- **Zustand**: https://github.com/pmndrs/zustand

---

Happy coding! 🎉
