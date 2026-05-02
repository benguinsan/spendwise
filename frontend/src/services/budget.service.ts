import { api } from "@/lib/api";

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  userId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    try {
      const data = await api.budgets.getAll();
      return Array.isArray(data) ? (data as Budget[]) : [];
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      return [];
    }
  },

  async getByUser(userId: string): Promise<Budget[]> {
    try {
      const data = await api.budgets.getByUser(userId);
      return Array.isArray(data) ? (data as Budget[]) : [];
    } catch (error) {
      console.error("Failed to fetch budgets by user:", error);
      return [];
    }
  },

  async getOne(id: string): Promise<Budget | null> {
    try {
      const data = await api.budgets.getOne(id);
      return (data as Budget) || null;
    } catch (error) {
      console.error("Failed to fetch budget:", error);
      return null;
    }
  },

  async create(data: Partial<Budget>): Promise<Budget | null> {
    try {
      const result = await api.budgets.create(data);
      return (result as Budget) || null;
    } catch (error) {
      console.error("Failed to create budget:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Budget>): Promise<Budget | null> {
    try {
      const result = await api.budgets.update(id, data);
      return (result as Budget) || null;
    } catch (error) {
      console.error("Failed to update budget:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.budgets.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete budget:", error);
      throw error;
    }
  },
};
