import { api } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  icon?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const data = await api.categories.getAll();
      return Array.isArray(data) ? (data as Category[]) : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  async getByType(type: string): Promise<Category[]> {
    try {
      const data = await api.categories.getByType(type);
      return Array.isArray(data) ? (data as Category[]) : [];
    } catch (error) {
      console.error("Failed to fetch categories by type:", error);
      return [];
    }
  },

  async getDefaults(): Promise<Category[]> {
    try {
      const data = await api.categories.getDefaults();
      return Array.isArray(data) ? (data as Category[]) : [];
    } catch (error) {
      console.error("Failed to fetch default categories:", error);
      return [];
    }
  },

  async getOne(id: string): Promise<Category | null> {
    try {
      const data = await api.categories.getOne(id);
      return (data as Category) || null;
    } catch (error) {
      console.error("Failed to fetch category:", error);
      return null;
    }
  },

  async create(data: Partial<Category>): Promise<Category | null> {
    try {
      const result = await api.categories.create(data);
      return (result as Category) || null;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    try {
      const result = await api.categories.update(id, data);
      return (result as Category) || null;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.categories.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },
};
