// API client with all endpoints
import { apiClient } from "./api-client";

// Type definitions
export interface BaseResponse {
  message?: string;
}

export interface User extends BaseResponse {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse extends BaseResponse {
  provider: string;
  user?: User;
  userConfirmed: boolean;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Wallet extends BaseResponse {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId?: string;
}

export interface Transaction extends BaseResponse {
  id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  userId?: string;
  walletId?: string;
  fromWalletId?: string;
  toWalletId?: string;
}

export interface Category extends BaseResponse {
  id: string;
  name: string;
  type: string;
  icon?: string;
  userId?: string;
}

export interface Budget extends BaseResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  userId?: string;
}

export interface Tag extends BaseResponse {
  id: string;
  name: string;
  userId?: string;
}

export interface Goal extends BaseResponse {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline: string;
  userId?: string;
}

export interface Notification extends BaseResponse {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  userId?: string;
  createdAt?: string;
}

export interface RecurringTransaction extends BaseResponse {
  id: string;
  amount: number;
  type: string;
  interval: string;
  nextDate: string;
  isActive: boolean;
  userId?: string;
  walletId?: string;
  note?: string;
}

// API endpoints
export const api = {
  // Health check
  health: {
    check: () => apiClient.get<{ status: string; timestamp: string }>("/health"),
  },

  // Authentication
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      apiClient.post<AuthResponse>("/auth/register", data, { skipAuth: true }),
    
    login: (data: { email: string; password: string }) =>
      apiClient.post<AuthResponse>("/auth/login", data, { skipAuth: true }),
    
    confirmSignup: (data: { email: string; confirmationCode: string }) =>
      apiClient.post<AuthResponse>("/auth/confirm-signup", data, { skipAuth: true }),
    
    getProfile: () => apiClient.get<User>("/auth/me"),
    
    getCognitoProfile: () => apiClient.get<User>("/auth/cognito/me"),
  },

  // Users
  users: {
    getAll: (skip = 0, take = 10) =>
      apiClient.get<PaginatedResponse<User>>(`/users?skip=${skip}&take=${take}`),
    
    getOne: (id: string) => apiClient.get<User>(`/users/${id}`),
    
    create: (data: Partial<User>) => apiClient.post<User>("/users", data),
    
    update: (id: string, data: Partial<User>) =>
      apiClient.patch<User>(`/users/${id}`, data),
    
    delete: (id: string) => apiClient.delete<BaseResponse>(`/users/${id}`),
  },

  // Wallets
  wallets: {
    getAll: () => apiClient.get<Wallet[]>("/wallets"),
    
    getByUser: (userId: string) =>
      apiClient.get<Wallet[]>(`/wallets/user/${userId}`),
    
    getOne: (id: string) => apiClient.get<Wallet>(`/wallets/${id}`),
    
    create: (data: Partial<Wallet>) => apiClient.post<Wallet>("/wallets", data),
    
    update: (id: string, data: Partial<Wallet>) =>
      apiClient.patch<Wallet>(`/wallets/${id}`, data),
    
    delete: (id: string) => apiClient.delete<BaseResponse>(`/wallets/${id}`),
  },

  // Transactions
  transactions: {
    getAll: () => apiClient.get<Transaction[]>("/transactions"),
    
    getByUser: (userId: string) =>
      apiClient.get<Transaction[]>(`/transactions/user/${userId}`),
    
    getByWallet: (walletId: string) =>
      apiClient.get<Transaction[]>(`/transactions/wallet/${walletId}`),
    
    getOne: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),
    
    create: (data: Partial<Transaction>) =>
      apiClient.post<Transaction>("/transactions", data),
    
    update: (id: string, data: Partial<Transaction>) =>
      apiClient.patch<Transaction>(`/transactions/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete<BaseResponse>(`/transactions/${id}`),
  },

  // Categories
  categories: {
    getAll: () => apiClient.get<Category[]>("/categories"),
    
    getByType: (type: string) =>
      apiClient.get<Category[]>(`/categories/type/${type}`),
    
    getDefaults: () => apiClient.get<Category[]>("/categories/defaults"),
    
    getOne: (id: string) => apiClient.get<Category>(`/categories/${id}`),
    
    create: (data: Partial<Category>) =>
      apiClient.post<Category>("/categories", data),
    
    update: (id: string, data: Partial<Category>) =>
      apiClient.patch<Category>(`/categories/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete<BaseResponse>(`/categories/${id}`),
  },

  // Budgets
  budgets: {
    getAll: () => apiClient.get<Budget[]>("/budgets"),
    
    getByUser: (userId: string) =>
      apiClient.get<Budget[]>(`/budgets/user/${userId}`),
    
    getOne: (id: string) => apiClient.get<Budget>(`/budgets/${id}`),
    
    create: (data: Partial<Budget>) => apiClient.post<Budget>("/budgets", data),
    
    update: (id: string, data: Partial<Budget>) =>
      apiClient.patch<Budget>(`/budgets/${id}`, data),
    
    delete: (id: string) => apiClient.delete<BaseResponse>(`/budgets/${id}`),
  },

  // Tags
  tags: {
    getAll: () => apiClient.get<Tag[]>("/tags"),
    
    getOne: (id: string) => apiClient.get<Tag>(`/tags/${id}`),
    
    getTransactions: (id: string) =>
      apiClient.get<Transaction[]>(`/tags/${id}/transactions`),
    
    create: (data: Partial<Tag>) => apiClient.post<Tag>("/tags", data),
    
    update: (id: string, data: Partial<Tag>) =>
      apiClient.patch<Tag>(`/tags/${id}`, data),
    
    delete: (id: string) => apiClient.delete<BaseResponse>(`/tags/${id}`),
  },

  // Goals
  goals: {
    getAll: (userId: string) =>
      apiClient.get<Goal[]>(`/goals?userId=${userId}`),
    
    getSummary: (userId: string) =>
      apiClient.get<Goal[]>(`/goals/summary/${userId}`),
    
    getOne: (id: string, userId: string) =>
      apiClient.get<Goal>(`/goals/${id}?userId=${userId}`),
    
    create: (data: Partial<Goal>) => apiClient.post<Goal>("/goals", data),
    
    update: (id: string, userId: string, data: Partial<Goal>) =>
      apiClient.patch<Goal>(`/goals/${id}?userId=${userId}`, data),
    
    updateProgress: (id: string, userId: string, data: { amount: number }) =>
      apiClient.post<Goal>(`/goals/${id}/progress?userId=${userId}`, data),
    
    delete: (id: string, userId: string) =>
      apiClient.delete<BaseResponse>(`/goals/${id}?userId=${userId}`),
  },

  // Notifications
  notifications: {
    getAll: (userId: string) =>
      apiClient.get<Notification[]>(`/notifications?userId=${userId}`),
    
    getSummary: (userId: string) =>
      apiClient.get<Notification[]>(`/notifications/summary/${userId}`),
    
    getOne: (id: string, userId: string) =>
      apiClient.get<Notification>(`/notifications/${id}?userId=${userId}`),
    
    markAsRead: (id: string, userId: string) =>
      apiClient.patch<BaseResponse>(
        `/notifications/${id}/read?userId=${userId}`,
      ),
    
    markAllAsRead: (userId: string) =>
      apiClient.patch<BaseResponse>(
        `/notifications/batch/read-all?userId=${userId}`,
      ),
    
    delete: (id: string, userId: string) =>
      apiClient.delete<BaseResponse>(`/notifications/${id}?userId=${userId}`),
    
    deleteAll: (userId: string) =>
      apiClient.delete<BaseResponse>(`/notifications?userId=${userId}`),
  },

  // Recurring Transactions
  recurringTransactions: {
    getAll: (userId: string) =>
      apiClient.get<RecurringTransaction[]>(
        `/recurring-transactions?userId=${userId}`,
      ),
    
    getOne: (id: string, userId: string) =>
      apiClient.get<RecurringTransaction>(
        `/recurring-transactions/${id}?userId=${userId}`,
      ),
    
    getNextExecutions: (id: string, userId: string, count = 5) =>
      apiClient.get<RecurringTransaction[]>(
        `/recurring-transactions/${id}/next-executions?userId=${userId}&count=${count}`,
      ),
    
    create: (data: Partial<RecurringTransaction>) =>
      apiClient.post<RecurringTransaction>("/recurring-transactions", data),
    
    update: (
      id: string,
      userId: string,
      data: Partial<RecurringTransaction>,
    ) =>
      apiClient.patch<RecurringTransaction>(
        `/recurring-transactions/${id}?userId=${userId}`,
        data,
      ),
    
    toggle: (id: string, userId: string, isActive: boolean) =>
      apiClient.patch<BaseResponse>(
        `/recurring-transactions/${id}/toggle?userId=${userId}`,
        { isActive },
      ),
    
    delete: (id: string, userId: string) =>
      apiClient.delete<BaseResponse>(
        `/recurring-transactions/${id}?userId=${userId}`,
      ),
  },
};

export default api;

// Re-export errors for convenience
export { APIError, NetworkError } from "./api-client";
