import { api } from "@/lib/api";

export interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  note?: string;
  date: string;
  userId?: string;
  fromWalletId?: string;
  toWalletId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    try {
      const data = await api.transactions.getAll();
      return Array.isArray(data) ? (data as Transaction[]) : [];
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return [];
    }
  },

  async getByUser(userId: string): Promise<Transaction[]> {
    try {
      const data = await api.transactions.getByUser(userId);
      return Array.isArray(data) ? (data as Transaction[]) : [];
    } catch (error) {
      console.error("Failed to fetch transactions by user:", error);
      return [];
    }
  },

  async getByWallet(walletId: string): Promise<Transaction[]> {
    try {
      const data = await api.transactions.getByWallet(walletId);
      return Array.isArray(data) ? (data as Transaction[]) : [];
    } catch (error) {
      console.error("Failed to fetch transactions by wallet:", error);
      return [];
    }
  },

  async getOne(id: string): Promise<Transaction | null> {
    try {
      const data = await api.transactions.getOne(id);
      return (data as Transaction) || null;
    } catch (error) {
      console.error("Failed to fetch transaction:", error);
      return null;
    }
  },

  async create(data: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const result = await api.transactions.create(data);
      return (result as Transaction) || null;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<Transaction>,
  ): Promise<Transaction | null> {
    try {
      const result = await api.transactions.update(id, data);
      return (result as Transaction) || null;
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.transactions.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  },
};
