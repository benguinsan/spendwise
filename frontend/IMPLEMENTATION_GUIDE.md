# Placeholder Pages Implementation Guide

**Created**: April 23, 2026  
**Purpose**: Step-by-step guide to implement remaining placeholder pages following established patterns

---

## Overview

5 placeholder pages need implementation:
1. ✅ **ExpensesPage** - Complete (reference implementation)
2. ⚠️ **CategoriesPage** - Placeholder (needs implementation)
3. ⚠️ **WalletsPage** - Placeholder (needs implementation)
4. ⚠️ **BudgetsPage** - Placeholder (needs implementation)
5. ⚠️ **GoalsPage** - Placeholder (needs implementation)
6. ⚠️ **ReportsPage** - Placeholder (needs implementation)

**Reference Implementation**: `src/pages/expenses/ExpensesPage.tsx` (270 lines) - Copy this pattern for all pages

---

## Implementation Pattern

Every feature page follows this 5-layer architecture:

```
1. Component (Page)      - Handle UI state and rendering
   ↓
2. Hooks (React Query)  - Handle data fetching & mutations
   ↓
3. API Services        - Handle HTTP requests
   ↓
4. Axios + Interceptors - Handle authentication & errors
   ↓
5. Backend API         - Returns data
```

---

## Step-by-Step: How to Implement a Page

### Template: Category Management Page

This shows all 5 steps to implement a new feature.

#### Step 1: Update API Service

**File**: `src/api/categories.api.ts`

```typescript
import { apiClient } from "@config/api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
} from "@types";

export const categoriesApi = {
  // Fetch all categories for current user
  getAll: async (
    skip = 0,
    take = 10,
    filters?: { userId?: string; type?: string },
  ): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get("/categories", {
      params: { skip, take, ...filters },
    });
    return response.data;
  },

  // Fetch all default categories (system categories)
  getDefaults: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories/defaults");
    return response.data;
  },

  // Fetch single category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  // Update category
  update: async (
    id: string,
    data: UpdateCategoryRequest,
  ): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
```

#### Step 2: Create React Query Hooks

**File**: `src/hooks/useCategories.ts`

```typescript
import {
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { categoriesApi } from "@api/categories.api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
} from "@types";

// Fetch all categories
export const useCategories = (
  filters?: { userId?: string; type?: string; skip?: number; take?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Category>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories", filters],
    queryFn: () =>
      categoriesApi.getAll(
        filters?.skip || 0,
        filters?.take || 10,
        filters,
      ),
    enabled: !!filters?.userId, // Only fetch if userId provided
    ...options,
  });
};

// Fetch single category
export const useCategoryById = (
  id: string,
  options?: Omit<UseQueryOptions<Category>, "queryKey" | "queryFn">,
) => {
  return useQuery<Category>({
    queryKey: ["categories", id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
  });
};
```

#### Step 3: Create Page Component

**File**: `src/pages/categories/CategoriesPage.tsx`

```typescript
import { FC, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAuthStore } from "@stores/auth.store";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@hooks/useCategories";
import { Table } from "@components/common/Table";
import { Modal } from "@components/common/Modal";
import { LoadingSpinner } from "@components/common/LoadingSpinner";
import { Category, CreateCategoryRequest } from "@types";

const CategoriesPage: FC = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCategoryRequest>>({
    type: "EXPENSE",
    name: "",
  });

  // Fetch categories
  const { data, isLoading } = useCategories(
    { userId: user?.id },
    { enabled: !!user?.id },
  );

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Handle opening modal for create/edit
  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        type: category.type,
      });
    } else {
      setEditingId(null);
      setFormData({ type: "EXPENSE", name: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ type: "EXPENSE", name: "" });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id || !formData.name) return;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: { name: formData.name },
        });
      } else {
        await createMutation.mutateAsync({
          userId: user.id,
          name: formData.name,
          type: formData.type as any,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Add Category
        </Button>
      </Stack>

      {/* Table */}
      <Card>
        <CardContent>
          <Table
            columns={[
              { id: "name", label: "Category Name" },
              { id: "type", label: "Type" },
              { id: "icon", label: "Icon" },
              {
                id: "id",
                label: "Actions",
                render: (_, row) => (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => handleOpenModal(row as Category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                ),
              },
            ]}
            data={(data?.data || []) as Category[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        title={editingId ? "Edit Category" : "Add Category"}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? "Update" : "Add"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Stack spacing={2}>
          <TextField
            label="Category Name"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, name: e.target.value }))
            }
            fullWidth
            placeholder="e.g., Groceries"
          />
          <TextField
            select
            label="Type"
            value={formData.type || "EXPENSE"}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, type: e.target.value }))
            }
            fullWidth
            SelectProps={{ native: true }}
            disabled={!!editingId}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="TRANSFER">Transfer</option>
          </TextField>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CategoriesPage;
```

---

## Checklist for Implementing Each Page

### Before Starting
- [ ] Copy `ExpensesPage.tsx` structure
- [ ] Identify CRUD operations needed
- [ ] Check backend API endpoints exist
- [ ] Review type definitions in `@types`

### Implementation Steps
- [ ] Create/update API service in `src/api/`
- [ ] Create/update hooks in `src/hooks/`
- [ ] Create page component in `src/pages/[feature]/`
- [ ] Add route to `src/App.tsx` (if not already there)
- [ ] Test with backend
- [ ] Fix any type errors
- [ ] Verify all CRUD operations

### Testing Steps
- [ ] Test fetch/list operations
- [ ] Test create operation
- [ ] Test read/edit operation
- [ ] Test delete operation
- [ ] Verify form validation
- [ ] Verify error handling
- [ ] Check Network tab for proper API calls
- [ ] No console errors

---

## Page-Specific Implementation Guide

### 1. Categories Page

**Files to create/modify**:
- ✅ `src/api/categories.api.ts` - Already exists
- ✅ `src/hooks/useCategories.ts` - Already exists (basic)
- ⚠️ `src/pages/categories/CategoriesPage.tsx` - Replace placeholder

**Backend Endpoints**:
- GET `/categories` - List
- POST `/categories` - Create
- PATCH `/categories/:id` - Update
- DELETE `/categories/:id` - Delete

**Key Fields**:
- `name`: string
- `type`: "INCOME" | "EXPENSE" | "TRANSFER"
- `icon`: string (optional)

**Special Considerations**:
- Categories can be default (system) or user-created
- Type should be immutable after creation
- Icon selection interface (if supported)

---

### 2. Wallets Page

**Files to create/modify**:
- ✅ `src/api/wallets.api.ts` - Already exists
- ✅ `src/hooks/useWallets.ts` - Already exists
- ⚠️ `src/pages/wallets/WalletsPage.tsx` - Replace placeholder

**Backend Endpoints**:
- GET `/wallets` - List
- POST `/wallets` - Create
- PATCH `/wallets/:id` - Update
- DELETE `/wallets/:id` - Delete
- PATCH `/wallets/:id/balance` - Update balance

**Key Fields**:
- `name`: string
- `balance`: number (can be edited)
- `currency`: string (default: "VND")

**Special Considerations**:
- Show current balance prominently
- Allow currency selection on create
- Warn user before deletion

---

### 3. Budgets Page

**Files to create/modify**:
- ✅ `src/api/budgets.api.ts` - Already exists
- ✅ `src/hooks/useBudgets.ts` - Already exists
- ⚠️ `src/pages/budgets/BudgetsPage.tsx` - Replace placeholder

**Backend Endpoints**:
- GET `/budgets` - List
- POST `/budgets` - Create
- PATCH `/budgets/:id` - Update
- DELETE `/budgets/:id` - Delete

**Key Fields**:
- `amount`: number
- `month`: number (1-12)
- `year`: number
- `categoryId`: string
- `spent`: number (calculated)
- `remaining`: number (calculated)

**Special Considerations**:
- Show spent vs budget progress bar
- Filter by month/year
- Highlight overspent budgets
- Group by category
- Show spent amount alongside budget

---

### 4. Goals Page

**Files to create/modify**:
- ✅ `src/api/goals.api.ts` - Already exists
- ✅ `src/hooks/useGoals.ts` - Already exists
- ⚠️ `src/pages/goals/GoalsPage.tsx` - Replace placeholder

**Backend Endpoints**:
- GET `/goals` - List
- POST `/goals` - Create
- PATCH `/goals/:id` - Update
- DELETE `/goals/:id` - Delete

**Key Fields**:
- `name`: string
- `target`: number (target amount)
- `current`: number (current progress)
- `deadline`: string (ISO date)

**Special Considerations**:
- Show progress bars (current/target)
- Show percentage complete
- Sort by deadline
- Show days remaining
- Color code (on track vs at risk)

---

### 5. Reports Page

**Files to create/modify**:
- ⚠️ Create `src/api/reports.api.ts` (new)
- ⚠️ Create `src/hooks/useReports.ts` (new)
- ⚠️ `src/pages/reports/ReportsPage.tsx` - Replace placeholder

**Backend Endpoints** (to be created):
- GET `/reports/summary` - Overall summary
- GET `/reports/daily` - Daily breakdown
- GET `/reports/category` - By category
- GET `/reports/trends` - Trends over time

**Key Features**:
- Date range picker
- Multiple chart types (bar, pie, line, area)
- Export to CSV/PDF (optional)
- Trend analysis
- Category breakdown
- Period comparison

**Special Considerations**:
- Use Recharts for visualizations
- Implement date range filtering
- Show trends and insights
- Performance optimization for large datasets

---

## Common Issues & Solutions

### Issue 1: Type errors on API response

**Error**: `Property 'X' does not exist on type 'Y'`

**Solution**:
1. Check backend returns correct fields
2. Verify types in `@types/index.ts`
3. Update types if API response changed

### Issue 2: Hook not refetching after mutation

**Error**: Data doesn't update after create/edit/delete

**Solution**:
```typescript
// In mutation hook, add onSuccess:
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
```

### Issue 3: Modal not closing after submit

**Error**: Modal stays open after successful submit

**Solution**:
```typescript
// Make sure handleCloseModal() is called:
const handleSubmit = async () => {
  try {
    // ... API call
    handleCloseModal(); // ← Add this
  } catch (error) {
    // Handle error
  }
};
```

### Issue 4: Network calls failing with 401

**Error**: Unauthorized errors in Network tab

**Solution**:
1. Check user is logged in (useAuthStore)
2. Verify tokens are in localStorage
3. Check Axios interceptors are working
4. Verify backend accepts requests

### Issue 5: Table showing old data

**Error**: Table doesn't update after changes

**Solution**:
```typescript
// Ensure data is fetched with proper keys:
const { data } = useCategories(
  { userId: user?.id },  // Include userId in key
  { enabled: !!user?.id }
);
```

---

## Quick Reference: Page Template

```typescript
import { FC, useState } from "react";
import { Stack, Card, CardContent, Button, Typography, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAuthStore } from "@stores/auth.store";
import { use[Feature] } from "@hooks/use[Feature]";
import { Table } from "@components/common/Table";
import { Modal } from "@components/common/Modal";
import { LoadingSpinner } from "@components/common/LoadingSpinner";
import { [Type], Create[Type]Request } from "@types";

const [Feature]Page: FC = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Create[Type]Request>>({});

  const { data, isLoading } = use[Feature](
    { userId: user?.id },
    { enabled: !!user?.id }
  );
  const createMutation = useCreate[Feature]();
  const updateMutation = useUpdate[Feature]();
  const deleteMutation = useDelete[Feature]();

  const handleOpenModal = (item?: [Type]) => { /* ... */ };
  const handleCloseModal = () => { /* ... */ };
  const handleSubmit = async () => { /* ... */ };
  const handleDelete = async (id: string) => { /* ... */ };

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>[Feature]</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Add [Item]
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Table columns={[]} data={data?.data || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        title={editingId ? "Edit" : "Add"}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
      >
        {/* Form fields */}
      </Modal>
    </Stack>
  );
};

export default [Feature]Page;
```

---

## Priority Order

Implement pages in this order:

1. **CategoriesPage** (Easy) - 2 hours
2. **WalletsPage** (Easy) - 2 hours  
3. **BudgetsPage** (Medium) - 3 hours
4. **GoalsPage** (Medium) - 3 hours
5. **ReportsPage** (Hard) - 4-5 hours

**Total Time**: ~14-15 hours for one developer

---

## Success Criteria

For each implemented page:
- [ ] All CRUD operations work
- [ ] Form validation works
- [ ] Error handling works
- [ ] Data updates after mutations
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design
- [ ] Tests pass

---

## Support Resources

- **ExpensesPage**: Reference implementation (270 lines)
- **API Services**: `src/api/*.api.ts` (already implemented)
- **Hooks**: `src/hooks/use*.ts` (already implemented)
- **Components**: `src/components/common/*` (reusable components)
- **Types**: `src/types/index.ts` (all type definitions)

---

**Happy coding! 🚀**

