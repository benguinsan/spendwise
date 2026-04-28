# API Integration Guide - SpendWise Frontend

This guide explains how to properly integrate backend APIs into the frontend following the established patterns.

## 🎯 Integration Pattern

Every feature follows this 4-layer pattern:

```
Component → Hook → API Service → Axios Instance → Backend
```

### Layer 1: Component (React Component)
```typescript
// src/pages/my-feature/MyFeaturePage.tsx
import { useMyFeature, useCreateMyFeature } from '@hooks/useMyFeature'

function MyFeaturePage() {
  const { data, isLoading } = useMyFeature()
  const createMutation = useCreateMyFeature()

  const handleCreate = (data) => {
    createMutation.mutate(data)
  }

  return (
    // JSX
  )
}
```

### Layer 2: Hook (React Query + Zustand)
```typescript
// src/hooks/useMyFeature.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { myFeatureApi } from '@api/my-feature.api'

export const useMyFeature = () => {
  return useQuery({
    queryKey: ['my-feature'],
    queryFn: () => myFeatureApi.getAll(),
  })
}

export const useCreateMyFeature = () => {
  return useMutation({
    mutationFn: (data) => myFeatureApi.create(data),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['my-feature'] })
    },
  })
}
```

### Layer 3: API Service
```typescript
// src/api/my-feature.api.ts
import { apiClient } from '@config/api'
import { MyFeature, CreateMyFeatureRequest } from '@types'

export const myFeatureApi = {
  getAll: async () => {
    const response = await apiClient.get('/my-features')
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/my-features/${id}`)
    return response.data
  },

  create: async (data: CreateMyFeatureRequest) => {
    const response = await apiClient.post('/my-features', data)
    return response.data
  },

  update: async (id: string, data: Partial<MyFeature>) => {
    const response = await apiClient.patch(`/my-features/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/my-features/${id}`)
  },
}
```

### Layer 4: Axios Instance with Interceptors
```typescript
// src/config/api.ts (already configured)
// Automatically handles:
// - JWT token injection
// - Token refresh on 401
// - Error handling
// - Request/response logging
```

## 📝 Type Definitions

Always define TypeScript types in `src/types/index.ts`:

```typescript
// src/types/index.ts

// Domain Models
export interface MyFeature {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

// API Requests
export interface CreateMyFeatureRequest {
  name: string
  description: string
}

export interface UpdateMyFeatureRequest {
  name?: string
  description?: string
}

// API Responses (already handled by apiClient)
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  skip: number
  take: number
}
```

## 🔄 Implementing Transactions Feature

As a complete example, here's how Transactions are implemented:

### 1. Types (src/types/index.ts)
```typescript
export interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  note: string
  date: string
  userId: string
  walletId?: string
  categoryId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionRequest {
  amount: number
  type: TransactionType
  note: string
  date: string
  userId?: string
  walletId?: string
  categoryId?: string
}
```

### 2. API Service (src/api/transactions.api.ts)
```typescript
export const transactionsApi = {
  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post('/transactions', data)
    return response.data
  },

  getAll: async (skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get('/transactions', {
      params: { skip, take }
    })
    return response.data
  },

  // ... more methods
}
```

### 3. React Query Hooks (src/hooks/useTransactions.ts)
```typescript
export const useTransactions = (filters: GetTransactionsFilters) => {
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters.skip, filters.take),
  })
}

export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: (data) => transactionsApi.create(data),
    onSuccess: () => {
      // Refetch transactions after creating
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
```

### 4. Component Usage (src/pages/expenses/ExpensesPage.tsx)
```typescript
function ExpensesPage() {
  const { data: txData, isLoading } = useTransactions({ userId: user?.id })
  const createMutation = useCreateTransaction()

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data)
  }

  return (
    <Table columns={columns} data={txData?.data} />
  )
}
```

## 🔐 Authentication Endpoints Pattern

For any endpoint requiring authentication:

1. **Include userId in request** (query param or body)
2. **Add userId to query key** (for proper cache invalidation)

```typescript
// ✅ Good - userId in query params
const { data } = useQuery({
  queryKey: ['transactions', userId],  // Include userId
  queryFn: () => transactionsApi.getByUserId(userId),
})

// ✅ Good - userId in filters
const { data } = useQuery({
  queryKey: ['transactions', filters.userId],
  queryFn: () => transactionsApi.getAll(filters),
})

// ❌ Bad - No userId in query key
const { data } = useQuery({
  queryKey: ['transactions'],  // Wrong!
  queryFn: () => transactionsApi.getByUserId(userId),
})
```

## 📡 Common API Patterns

### Pagination Pattern
```typescript
// API Service
export const getAll = async (skip = 0, take = 10) => {
  const response = await apiClient.get('/resources', {
    params: { skip, take }
  })
  return response.data  // Returns PaginatedResponse<T>
}

// Hook
export const useResources = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['resources', page, pageSize],
    queryFn: () => getAll(page * pageSize, pageSize),
  })
}

// Component
const [page, setPage] = useState(0)
const [pageSize, setPageSize] = useState(10)
const { data } = useResources(page, pageSize)

// Table pagination handler
onPageChange={(newPage) => setPage(newPage)}
```

### Filter Pattern
```typescript
// API Service
export const getAll = async (filters?: {
  userId?: string
  walletId?: string
  type?: string
}) => {
  const response = await apiClient.get('/resources', {
    params: filters
  })
  return response.data
}

// Hook
export const useResources = (filters: FilterOptions) => {
  return useQuery({
    queryKey: ['resources', filters],  // Filters in key
    queryFn: () => getAll(filters),
    enabled: filters.userId ? true : false,  // Enable when userId exists
  })
}

// Component
const [filters, setFilters] = useState({ userId: '', type: 'EXPENSE' })
const { data } = useResources(filters)
```

### Mutation with Success Handling
```typescript
export const useCreateResource = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateRequest) => api.create(data),
    onSuccess: (newData) => {
      // Update cache with new data
      queryClient.setQueryData(['resources', newData.userId], (old: any) => [
        ...old,
        newData
      ])
      
      // Or invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
    onError: (error) => {
      // Handle error
      console.error('Failed:', error)
    },
  })
}
```

## 🔄 Query Invalidation

When to invalidate queries:

```typescript
import { useQueryClient } from '@tanstack/react-query'

function useUpdateResource() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => api.update(data),
    onSuccess: (updatedData) => {
      // Invalidate specific query
      queryClient.invalidateQueries({ 
        queryKey: ['resources', updatedData.id] 
      })
      
      // Invalidate all resources queries
      queryClient.invalidateQueries({ 
        queryKey: ['resources'] 
      })
      
      // Invalidate specific filter combination
      queryClient.invalidateQueries({
        queryKey: ['resources', { userId: updatedData.userId }]
      })
    },
  })
}
```

## 🛡️ Error Handling

### In Component
```typescript
function MyComponent() {
  const { data, error, isError } = useQuery({
    queryFn: api.getAll,
  })

  if (isError) {
    return <ErrorAlert message={error.message} />
  }

  // ...
}
```

### In Mutation
```typescript
const createMutation = useMutation({
  mutationFn: api.create,
  onError: (error: AxiosError) => {
    const message = error.response?.data?.message || 'Failed'
    setError(message)
  },
  onSuccess: () => {
    setError(null)
  },
})
```

## 📊 Advanced: Infinite Queries

For scrollable lists without pagination:

```typescript
export const useInfiniteResources = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['resources', 'infinite', userId],
    queryFn: ({ pageParam = 0 }) =>
      api.getAll(pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.skip + lastPage.take < lastPage.total) {
        return lastPage.skip + lastPage.take
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

// In component
function InfiniteList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteResources(userId)

  return (
    <InfiniteScroll
      dataLength={data?.pages.length || 0}
      next={fetchNextPage}
      hasMore={hasNextPage || false}
    >
      {data?.pages.map(page =>
        page.data.map(item => <Item key={item.id} {...item} />)
      )}
    </InfiniteScroll>
  )
}
```

## 🔗 Custom Hooks Pattern

Create reusable logic:

```typescript
// src/hooks/useTransactionFilters.ts
export const useTransactionFilters = (initialFilters?: Filters) => {
  const [filters, setFilters] = useState(initialFilters || {})
  const { data, isLoading } = useTransactions(filters)

  return {
    filters,
    setFilters,
    transactions: data?.data || [],
    isLoading,
    hasMore: data ? data.skip + data.take < data.total : false,
  }
}

// Usage in component
function TransactionList() {
  const { filters, setFilters, transactions } = useTransactionFilters()

  return (
    <>
      <FilterForm onChange={setFilters} />
      <TransactionTable data={transactions} />
    </>
  )
}
```

## 📚 Checklist for New Feature

- [ ] Add types to `src/types/index.ts`
- [ ] Create API service at `src/api/<feature>.api.ts`
- [ ] Create hooks at `src/hooks/use<Feature>.ts`
- [ ] Export hooks from `src/hooks/index.ts`
- [ ] Create page component at `src/pages/<feature>/<Feature>Page.tsx`
- [ ] Add route to `src/App.tsx`
- [ ] Add navigation item to `src/layouts/MainLayout.tsx`
- [ ] Test CRUD operations
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test responsive design

## 🚀 Performance Tips

1. **Use pagination** for large datasets
2. **Implement query caching** (already configured)
3. **Debounce search/filter inputs**
4. **Use useCallback** for expensive functions
5. **Memoize components** with React.memo
6. **Use virtual lists** for very large tables

Example debounce:

```typescript
import { debounce } from 'lodash-es'

const handleSearch = debounce((query: string) => {
  setFilters(prev => ({ ...prev, search: query }))
}, 300)
```

---

This pattern ensures consistency, maintainability, and type safety across the entire frontend!
