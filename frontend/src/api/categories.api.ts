import { apiClient } from "@config/api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  TransactionType,
} from "@types";

export const categoriesApi = {
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  getAll: async (
    skip = 0,
    take = 20,
    type?: TransactionType,
  ): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get("/categories", {
      params: { skip, take, ...(type && { type }) },
    });
    return response.data;
  },

  getByType: async (type: TransactionType): Promise<Category[]> => {
    const response = await apiClient.get(`/categories/type/${type}`);
    return response.data;
  },

  getDefaults: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories/defaults");
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateCategoryRequest,
  ): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
