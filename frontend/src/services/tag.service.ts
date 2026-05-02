import { api } from "@/lib/api";

export interface Tag {
  id: string;
  name: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const tagService = {
  async getAll(): Promise<Tag[]> {
    try {
      const data = await api.tags.getAll();
      return Array.isArray(data) ? (data as Tag[]) : [];
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  },

  async getOne(id: string): Promise<Tag | null> {
    try {
      const data = await api.tags.getOne(id);
      return (data as Tag) || null;
    } catch (error) {
      console.error("Failed to fetch tag:", error);
      return null;
    }
  },

  async create(data: Partial<Tag>): Promise<Tag | null> {
    try {
      const result = await api.tags.create(data);
      return (result as Tag) || null;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Tag>): Promise<Tag | null> {
    try {
      const result = await api.tags.update(id, data);
      return (result as Tag) || null;
    } catch (error) {
      console.error("Failed to update tag:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.tags.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete tag:", error);
      throw error;
    }
  },
};
