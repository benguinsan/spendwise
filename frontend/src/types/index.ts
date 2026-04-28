// ==================== Authentication ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ==================== User ====================
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

// ==================== Wallet ====================
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletRequest {
  name: string;
  balance: number;
  currency: string;
  userId?: string;
}

export interface UpdateWalletRequest {
  name?: string;
  balance?: number;
  currency?: string;
}

// ==================== Category ====================
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  userId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  icon: string;
  userId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
}

// ==================== Transaction ====================
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  note: string;
  date: string;
  userId: string;
  walletId?: string;
  categoryId?: string;
  fromWalletId?: string;
  toWalletId?: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  note: string;
  date: string;
  userId?: string;
  walletId?: string;
  categoryId?: string;
  fromWalletId?: string;
  toWalletId?: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  note?: string;
  date?: string;
  categoryId?: string;
}

// ==================== Tag ====================
export interface Tag {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: string;
  userId?: string;
}

export interface UpdateTagRequest {
  name: string;
}

export interface TagAnalytics {
  tagId: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
  averageTransaction: number;
}

// ==================== Goal ====================
export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  target: number;
  current?: number;
  deadline: string;
  userId?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  target?: number;
  current?: number;
  deadline?: string;
}

export interface GoalSummary {
  totalGoals: number;
  totalTarget: number;
  totalProgress: number;
  goals: Goal[];
}

// ==================== Budget ====================
export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
  categoryId: string;
  spent?: number;
  remaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
  userId?: string;
  categoryId: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
}

// ==================== Recurring Transaction ====================
export type RecurrenceInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  interval: RecurrenceInterval;
  userId: string;
  walletId?: string;
  categoryId?: string;
  note?: string;
  isActive: boolean;
  lastExecuted?: string;
  nextExecution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionRequest {
  amount: number;
  type: TransactionType;
  interval: RecurrenceInterval;
  userId?: string;
  walletId?: string;
  categoryId?: string;
  note?: string;
}

export interface UpdateRecurringTransactionRequest {
  amount?: number;
  interval?: RecurrenceInterval;
  isActive?: boolean;
}

// ==================== API Response Types ====================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ==================== Dashboard ====================
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  walletCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// ==================== Reports ====================
export interface DailyReport {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  categories: CategoryBreakdown[];
}

export interface Report {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netChange: number;
  transactions: Transaction[];
  summary: {
    byCategory: CategoryBreakdown[];
    byWallet: WalletBreakdown[];
  };
}

export interface WalletBreakdown {
  walletId: string;
  walletName: string;
  amount: number;
  percentage: number;
}
