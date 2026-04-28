import { apiClient } from "@config/api";
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  PaginatedResponse,
} from "@types";

export const budgetsApi = {
  create: async (data: CreateBudgetRequest): Promise<Budget> => {
    const response = await apiClient.post("/budgets", data);
    return response.data;
  },

  getAll: async (
    userId: string,
    skip = 0,
    take = 10,
  ): Promise<PaginatedResponse<Budget>> => {
    const response = await apiClient.get("/budgets", {
      params: { userId, skip, take },
    });
    return response.data;
  },

  getByUser: async (
    userId: string,
    month: number,
    year: number,
  ): Promise<Budget[]> => {
    const response = await apiClient.get(`/budgets/user/${userId}`, {
      params: { month, year },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Budget> => {
    const response = await apiClient.get(`/budgets/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateBudgetRequest): Promise<Budget> => {
    const response = await apiClient.patch(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
