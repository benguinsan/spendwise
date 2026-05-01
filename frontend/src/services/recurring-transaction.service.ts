import { api } from "@/lib/api";

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextDate: string;
  isActive: boolean;
  userId?: string;
  walletId?: string;
  categoryId?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const recurringTransactionService = {
  async getAll(userId: string): Promise<RecurringTransaction[]> {
    try {
      const data = await api.recurringTransactions.getAll(userId);
      return Array.isArray(data) ? (data as RecurringTransaction[]) : [];
    } catch (error) {
      console.error("Failed to fetch recurring transactions:", error);
      return [];
    }
  },

  async getOne(
    id: string,
    userId: string,
  ): Promise<RecurringTransaction | null> {
    try {
      const data = await api.recurringTransactions.getOne(id, userId);
      return (data as RecurringTransaction) || null;
    } catch (error) {
      console.error("Failed to fetch recurring transaction:", error);
      return null;
    }
  },

  async getNextExecutions(
    id: string,
    userId: string,
    count = 5,
  ): Promise<RecurringTransaction[]> {
    try {
      const data = await api.recurringTransactions.getNextExecutions(
        id,
        userId,
        count,
      );
      return Array.isArray(data) ? (data as RecurringTransaction[]) : [];
    } catch (error) {
      console.error("Failed to fetch next executions:", error);
      return [];
    }
  },

  async create(
    data: Partial<RecurringTransaction>,
  ): Promise<RecurringTransaction | null> {
    try {
      const result = await api.recurringTransactions.create(data);
      return (result as RecurringTransaction) || null;
    } catch (error) {
      console.error("Failed to create recurring transaction:", error);
      throw error;
    }
  },

  async update(
    id: string,
    userId: string,
    data: Partial<RecurringTransaction>,
  ): Promise<RecurringTransaction | null> {
    try {
      const result = await api.recurringTransactions.update(id, userId, data);
      return (result as RecurringTransaction) || null;
    } catch (error) {
      console.error("Failed to update recurring transaction:", error);
      throw error;
    }
  },

  async toggle(
    id: string,
    userId: string,
    isActive: boolean,
  ): Promise<boolean> {
    try {
      await api.recurringTransactions.toggle(id, userId, isActive);
      return true;
    } catch (error) {
      console.error("Failed to toggle recurring transaction:", error);
      throw error;
    }
  },

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      await api.recurringTransactions.delete(id, userId);
      return true;
    } catch (error) {
      console.error("Failed to delete recurring transaction:", error);
      throw error;
    }
  },
};
