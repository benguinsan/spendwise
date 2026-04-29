// API client types and functions
function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // Keep local development behavior without requiring env vars.
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  // In cloud environments, prefer same-origin proxy/rewrite (e.g. /api -> backend).
  return "/api";
}

const API_BASE_URL = getApiBaseUrl();

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Generic response types
interface BaseResponse {
  message?: string;
}

interface User extends BaseResponse {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse extends BaseResponse {
  provider: string;
  user?: User;
  userConfirmed: boolean;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface Wallet extends BaseResponse {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId: string;
}

interface Transaction extends BaseResponse {
  id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  userId: string;
}

interface Category extends BaseResponse {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

interface Budget extends BaseResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
}

interface Tag extends BaseResponse {
  id: string;
  name: string;
}

interface Goal extends BaseResponse {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline: string;
}

interface Notification extends BaseResponse {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
}

interface RecurringTransaction extends BaseResponse {
  id: string;
  amount: number;
  type: string;
  interval: string;
  nextDate: string;
  isActive: boolean;
}

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      const message =
        typeof data.message === "string"
          ? data.message
          : `HTTP ${response.status}`;
      throw new APIError(response.status, message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(
      `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      apiCall<AuthResponse>("/auth/register", "POST", data),
    login: (data: { email: string; password: string }) =>
      apiCall<AuthResponse>("/auth/login", "POST", data),
    confirmSignup: (data: { email: string; confirmationCode: string }) =>
      apiCall<AuthResponse>("/auth/confirm-signup", "POST", data),
    getCognitoProfile: () => apiCall<User>("/auth/cognito/me", "GET"),
  },
  users: {
    getAll: (skip = 0, take = 10) =>
      apiCall<PaginatedResponse<User>>(
        `/users?skip=${skip}&take=${take}`,
        "GET",
      ),
    getOne: (id: string) => apiCall<User>(`/users/${id}`, "GET"),
    create: (data: Partial<User>) => apiCall<User>("/users", "POST", data),
    update: (id: string, data: Partial<User>) =>
      apiCall<User>(`/users/${id}`, "PATCH", data),
    delete: (id: string) => apiCall<BaseResponse>(`/users/${id}`, "DELETE"),
  },
  wallets: {
    getAll: () => apiCall<Wallet[]>("/wallets", "GET"),
    getByUser: (userId: string) =>
      apiCall<Wallet[]>(`/wallets/user/${userId}`, "GET"),
    getOne: (id: string) => apiCall<Wallet>(`/wallets/${id}`, "GET"),
    create: (data: Partial<Wallet>) =>
      apiCall<Wallet>("/wallets", "POST", data),
    update: (id: string, data: Partial<Wallet>) =>
      apiCall<Wallet>(`/wallets/${id}`, "PATCH", data),
    delete: (id: string) => apiCall<BaseResponse>(`/wallets/${id}`, "DELETE"),
  },
  transactions: {
    getAll: () => apiCall<Transaction[]>("/transactions", "GET"),
    getByUser: (userId: string) =>
      apiCall<Transaction[]>(`/transactions/user/${userId}`, "GET"),
    getByWallet: (walletId: string) =>
      apiCall<Transaction[]>(`/transactions/wallet/${walletId}`, "GET"),
    getOne: (id: string) => apiCall<Transaction>(`/transactions/${id}`, "GET"),
    create: (data: Partial<Transaction>) =>
      apiCall<Transaction>("/transactions", "POST", data),
    update: (id: string, data: Partial<Transaction>) =>
      apiCall<Transaction>(`/transactions/${id}`, "PATCH", data),
    delete: (id: string) =>
      apiCall<BaseResponse>(`/transactions/${id}`, "DELETE"),
  },
  categories: {
    getAll: () => apiCall<Category[]>("/categories", "GET"),
    getByType: (type: string) =>
      apiCall<Category[]>(`/categories/type/${type}`, "GET"),
    getDefaults: () => apiCall<Category[]>("/categories/defaults", "GET"),
    getOne: (id: string) => apiCall<Category>(`/categories/${id}`, "GET"),
    create: (data: Partial<Category>) =>
      apiCall<Category>("/categories", "POST", data),
    update: (id: string, data: Partial<Category>) =>
      apiCall<Category>(`/categories/${id}`, "PATCH", data),
    delete: (id: string) =>
      apiCall<BaseResponse>(`/categories/${id}`, "DELETE"),
  },
  budgets: {
    getAll: () => apiCall<Budget[]>("/budgets", "GET"),
    getByUser: (userId: string) =>
      apiCall<Budget[]>(`/budgets/user/${userId}`, "GET"),
    getOne: (id: string) => apiCall<Budget>(`/budgets/${id}`, "GET"),
    create: (data: Partial<Budget>) =>
      apiCall<Budget>("/budgets", "POST", data),
    update: (id: string, data: Partial<Budget>) =>
      apiCall<Budget>(`/budgets/${id}`, "PATCH", data),
    delete: (id: string) => apiCall<BaseResponse>(`/budgets/${id}`, "DELETE"),
  },
  tags: {
    getAll: () => apiCall<Tag[]>("/tags", "GET"),
    getOne: (id: string) => apiCall<Tag>(`/tags/${id}`, "GET"),
    getTransactions: (id: string) =>
      apiCall<Transaction[]>(`/tags/${id}/transactions`, "GET"),
    create: (data: Partial<Tag>) => apiCall<Tag>("/tags", "POST", data),
    update: (id: string, data: Partial<Tag>) =>
      apiCall<Tag>(`/tags/${id}`, "PATCH", data),
    delete: (id: string) => apiCall<BaseResponse>(`/tags/${id}`, "DELETE"),
  },
  goals: {
    getAll: () => apiCall<Goal[]>("/goals", "GET"),
    getSummary: (userId: string) =>
      apiCall<Goal[]>(`/goals/summary/${userId}`, "GET"),
    getOne: (id: string) => apiCall<Goal>(`/goals/${id}`, "GET"),
    create: (data: Partial<Goal>) => apiCall<Goal>("/goals", "POST", data),
    update: (id: string, data: Partial<Goal>) =>
      apiCall<Goal>(`/goals/${id}`, "PATCH", data),
    updateProgress: (id: string, data: { amount: number }) =>
      apiCall<Goal>(`/goals/${id}/progress`, "POST", data),
    delete: (id: string) => apiCall<BaseResponse>(`/goals/${id}`, "DELETE"),
  },
  notifications: {
    getAll: () => apiCall<Notification[]>("/notifications", "GET"),
    getSummary: (userId: string) =>
      apiCall<Notification[]>(`/notifications/summary/${userId}`, "GET"),
    getOne: (id: string) =>
      apiCall<Notification>(`/notifications/${id}`, "GET"),
    markAsRead: (id: string) =>
      apiCall<BaseResponse>(`/notifications/${id}/read`, "PATCH"),
    markAllAsRead: () =>
      apiCall<BaseResponse>("/notifications/batch/read-all", "PATCH"),
    delete: (id: string) =>
      apiCall<BaseResponse>(`/notifications/${id}`, "DELETE"),
    deleteAll: () => apiCall<BaseResponse>("/notifications", "DELETE"),
  },
  recurringTransactions: {
    getAll: () =>
      apiCall<RecurringTransaction[]>("/recurring-transactions", "GET"),
    getOne: (id: string) =>
      apiCall<RecurringTransaction>(`/recurring-transactions/${id}`, "GET"),
    getNextExecutions: (id: string) =>
      apiCall<RecurringTransaction[]>(
        `/recurring-transactions/${id}/next-executions`,
        "GET",
      ),
    create: (data: Partial<RecurringTransaction>) =>
      apiCall<RecurringTransaction>("/recurring-transactions", "POST", data),
    update: (id: string, data: Partial<RecurringTransaction>) =>
      apiCall<RecurringTransaction>(
        `/recurring-transactions/${id}`,
        "PATCH",
        data,
      ),
    toggle: (id: string) =>
      apiCall<BaseResponse>(`/recurring-transactions/${id}/toggle`, "PATCH"),
    delete: (id: string) =>
      apiCall<BaseResponse>(`/recurring-transactions/${id}`, "DELETE"),
  },
};

export default api;
