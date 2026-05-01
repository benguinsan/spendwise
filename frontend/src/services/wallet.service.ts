import { api } from "@/lib/api";

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const walletService = {
  async getAll(): Promise<Wallet[]> {
    try {
      const data = await api.wallets.getAll();
      return Array.isArray(data) ? (data as Wallet[]) : [];
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      return [];
    }
  },

  async getByUser(userId: string): Promise<Wallet[]> {
    try {
      const data = await api.wallets.getByUser(userId);
      return Array.isArray(data) ? (data as Wallet[]) : [];
    } catch (error) {
      console.error("Failed to fetch wallets by user:", error);
      return [];
    }
  },

  async getOne(id: string): Promise<Wallet | null> {
    try {
      const data = await api.wallets.getOne(id);
      return (data as Wallet) || null;
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
      return null;
    }
  },

  async create(data: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const result = await api.wallets.create(data);
      return (result as Wallet) || null;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const result = await api.wallets.update(id, data);
      return (result as Wallet) || null;
    } catch (error) {
      console.error("Failed to update wallet:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.wallets.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      throw error;
    }
  },
};
