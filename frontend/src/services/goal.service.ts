import { api } from "@/lib/api";

export interface Goal {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const goalService = {
  async getAll(userId: string): Promise<Goal[]> {
    try {
      const data = await api.goals.getAll(userId);
      return Array.isArray(data) ? (data as Goal[]) : [];
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      return [];
    }
  },

  async getSummary(userId: string): Promise<Goal[]> {
    try {
      const data = await api.goals.getSummary(userId);
      return Array.isArray(data) ? (data as Goal[]) : [];
    } catch (error) {
      console.error("Failed to fetch goals summary:", error);
      return [];
    }
  },

  async getOne(id: string, userId: string): Promise<Goal | null> {
    try {
      const data = await api.goals.getOne(id, userId);
      return (data as Goal) || null;
    } catch (error) {
      console.error("Failed to fetch goal:", error);
      return null;
    }
  },

  async create(data: Partial<Goal>): Promise<Goal | null> {
    try {
      const result = await api.goals.create(data);
      return (result as Goal) || null;
    } catch (error) {
      console.error("Failed to create goal:", error);
      throw error;
    }
  },

  async update(
    id: string,
    userId: string,
    data: Partial<Goal>,
  ): Promise<Goal | null> {
    try {
      const result = await api.goals.update(id, userId, data);
      return (result as Goal) || null;
    } catch (error) {
      console.error("Failed to update goal:", error);
      throw error;
    }
  },

  async updateProgress(
    id: string,
    userId: string,
    amount: number,
  ): Promise<Goal | null> {
    try {
      const result = await api.goals.updateProgress(id, userId, { amount });
      return (result as Goal) || null;
    } catch (error) {
      console.error("Failed to update goal progress:", error);
      throw error;
    }
  },

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      await api.goals.delete(id, userId);
      return true;
    } catch (error) {
      console.error("Failed to delete goal:", error);
      throw error;
    }
  },
};
