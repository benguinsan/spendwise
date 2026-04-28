# SpendWise Frontend

A modern, fully-featured React + TypeScript + Vite + Material-UI frontend application for the SpendWise financial management system.

## 🚀 Features

- **Authentication**: Login, Register, Token refresh with JWT
- **Dashboard**: Overview with charts, stats, and recent transactions
- **Expense Management**: CRUD operations for transactions with filtering and pagination
- **Multi-Wallet Support**: Manage multiple wallets/accounts
- **Categories & Tags**: Organize transactions with categories and tags
- **Budgets**: Set and track budgets by category
- **Financial Goals**: Create and monitor savings goals
- **Reports**: Detailed financial analytics and visualizations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Type-Safe**: Full TypeScript implementation with comprehensive types

## 📋 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) 5
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts
- **Date Handling**: date-fns

## 🛠️ Prerequisites

- Node.js (v18+)
- npm or yarn
- SpendWise Backend running on `http://localhost:5000`

## 📦 Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the API URL:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── api/                    # API service layer
│   ├── auth.api.ts        # Authentication endpoints
│   ├── transactions.api.ts # Transaction endpoints
│   ├── categories.api.ts   # Category endpoints
│   ├── wallets.api.ts      # Wallet endpoints
│   ├── budgets.api.ts      # Budget endpoints
│   ├── goals.api.ts        # Goal endpoints
│   └── ...
├── components/
│   ├── common/             # Reusable components
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── StatCard.tsx
│   │   └── Alerts.tsx
│   └── ...
├── pages/
│   ├── auth/               # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── expenses/
│   │   └── ExpensesPage.tsx
│   ├── categories/
│   ├── wallets/
│   ├── budgets/
│   ├── goals/
│   └── reports/
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useWallets.ts
│   ├── useCategories.ts
│   ├── useBudgets.ts
│   └── useGoals.ts
├── stores/                 # Zustand stores
│   └── auth.store.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
├── utils/                  # Utility functions
│   └── formatters.ts
├── layouts/                # Layout components
│   ├── MainLayout.tsx
│   └── AuthLayout.tsx
├── config/                 # Configuration
│   └── api.ts             # Axios instance with interceptors
├── main.tsx               # Entry point
├── App.tsx                # Root component
└── index.css              # Global styles
```

## 🔑 Key Components

### API Service Layer (`src/api/`)

All API endpoints are organized by module with full TypeScript support:

```typescript
import { authApi, transactionsApi, walletsApi } from '@api'

// Login
const response = await authApi.login({ email, password })

// Get transactions
const transactions = await transactionsApi.getByUserId(userId)

// Create wallet
const wallet = await walletsApi.create({ name, balance, currency })
```

### React Query Hooks (`src/hooks/`)

Clean, reusable hooks for data fetching and mutations:

```typescript
import { useLogin, useTransactions, useWallets } from '@hooks'

// In component
const loginMutation = useLogin()
const { data: transactions } = useTransactions({ userId })
const { data: wallets } = useWallets(userId)
```

### Zustand Store (`src/stores/auth.store.ts`)

Global authentication state management:

```typescript
import { useAuthStore } from '@stores/auth.store'

const { user, accessToken, isAuthenticated, logout } = useAuthStore()
```

### Axios Interceptors (`src/config/api.ts`)

Automatic JWT token injection and refresh token handling:

- Request interceptor: Adds Authorization header
- Response interceptor: Handles 401 errors with token refresh
- Auto-logout on refresh failure

## 🔐 Authentication Flow

1. User logs in via `LoginPage`
2. `useLogin` hook calls `/auth/login`
3. Response contains `accessToken`, `refreshToken`, and `user`
4. Tokens stored in Zustand store (persisted to localStorage)
5. Access token injected in all API requests via axios interceptor
6. On 401 error, automatically refreshes token using refresh token
7. If refresh fails, user is logged out and redirected to login

## 📊 Available Pages

### Authentication
- **Login** (`/login`): Sign in with email/password
- **Register** (`/register`): Create new account

### Protected Routes
- **Dashboard** (`/dashboard`): Overview with charts and stats
- **Expenses** (`/expenses`): CRUD for transactions with table
- **Categories** (`/categories`): Manage expense categories
- **Wallets** (`/wallets`): Manage multiple wallets
- **Budgets** (`/budgets`): Set and track budgets
- **Goals** (`/goals`): Create and monitor financial goals
- **Reports** (`/reports`): View financial analytics

## 🎨 UI Components

### Common Components (`src/components/common/`)

- **Modal**: Reusable dialog with confirm/cancel
- **Table**: Data table with pagination and sorting
- **StatCard**: Dashboard stat card with trends
- **LoadingSpinner**: Loading indicator
- **Alerts**: Error, Success, Warning alerts

Usage example:

```typescript
<Modal
  open={true}
  title="Add Transaction"
  onConfirm={handleSubmit}
  onClose={handleClose}
>
  {/* Modal content */}
</Modal>

<Table
  columns={columns}
  data={data}
  pagination={{ total, page, rowsPerPage, ... }}
/>
```

## 🔄 API Integration

### Creating a New API Service

1. Create file in `src/api/<feature>.api.ts`:

```typescript
import { apiClient } from '@config/api'
import { MyType, CreateRequest, UpdateRequest } from '@types'

export const myApi = {
  create: async (data: CreateRequest): Promise<MyType> => {
    const response = await apiClient.post('/my-endpoint', data)
    return response.data
  },

  getAll: async (skip = 0, take = 10): Promise<PaginatedResponse<MyType>> => {
    const response = await apiClient.get('/my-endpoint', { params: { skip, take } })
    return response.data
  },

  // ... other methods
}
```

2. Create hooks in `src/hooks/useMyFeature.ts`:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { myApi } from '@api'

export const useMyFeature = () => {
  return useQuery({
    queryKey: ['my-feature'],
    queryFn: () => myApi.getAll(),
  })
}

export const useCreateMyFeature = () => {
  return useMutation({
    mutationFn: (data) => myApi.create(data),
  })
}
```

3. Use in components:

```typescript
function MyComponent() {
  const { data } = useMyFeature()
  const createMutation = useCreateMyFeature()

  return (
    // Use data and createMutation
  )
}
```

## 🧪 Error Handling

### API Errors

Errors are automatically caught and can be handled in components:

```typescript
const { mutate, error, isPending } = useMutation({
  mutationFn: myApi.create,
  onError: (error: AxiosError) => {
    const message = error.response?.data?.message || 'An error occurred'
    // Handle error
  },
})
```

### TypeScript Types

All API responses are fully typed:

```typescript
import { Transaction, Category, Wallet, Budget } from '@types'

// Types available for:
// - Authentication
// - Users
// - Wallets
// - Transactions
// - Categories
// - Tags
// - Goals
// - Budgets
// - Recurring Transactions
// - API Responses (PaginatedResponse, ApiError)
```

## 📈 Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Production Checklist

- [ ] Update API URL in `.env.production`
- [ ] Remove console logs
- [ ] Test all features
- [ ] Verify error handling
- [ ] Check responsive design
- [ ] Security: Validate all inputs
- [ ] Performance: Check bundle size

## 🐛 Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📚 API Documentation

See the Postman collection at the root: `spendwise-postman-collection.json`

### Key Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

- `GET /wallets` - List wallets
- `POST /wallets` - Create wallet
- `PATCH /wallets/:id` - Update wallet

- `GET /categories` - List categories
- `GET /categories/type/:type` - Get categories by type
- `POST /categories` - Create category

- `GET /budgets` - List budgets
- `POST /budgets` - Create budget

- `GET /goals` - List goals
- `POST /goals` - Create goal
- `POST /goals/:id/progress` - Add progress to goal

## 📞 Support

For API issues, refer to the backend documentation. For frontend issues, check:

1. Browser console for errors
2. Network tab for API requests
3. React DevTools for component state
4. TypeScript errors in terminal

## 🤝 Contributing

When adding new features:

1. Add API service in `src/api/`
2. Create React Query hooks in `src/hooks/`
3. Add TypeScript types in `src/types/`
4. Create reusable components in `src/components/`
5. Create page in `src/pages/`
6. Update routing in `src/App.tsx`

## 📄 License

This project is part of SpendWise. All rights reserved.
