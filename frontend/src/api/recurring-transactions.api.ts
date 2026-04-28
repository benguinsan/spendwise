import { apiClient } from "@config/api";
import {
  RecurringTransaction,
  CreateRecurringTransactionRequest,
  UpdateRecurringTransactionRequest,
  PaginatedResponse,
} from "@types";

export const recurringTransactionsApi = {
  create: async (
    data: CreateRecurringTransactionRequest,
  ): Promise<RecurringTransaction> => {
    const response = await apiClient.post("/recurring-transactions", data);
    return response.data;
  },

  getAll: async (
    userId: string,
    skip = 0,
    take = 10,
  ): Promise<PaginatedResponse<RecurringTransaction>> => {
    const response = await apiClient.get("/recurring-transactions", {
      params: { userId, skip, take },
    });
    return response.data;
  },

  getById: async (
    id: string,
    userId: string,
  ): Promise<RecurringTransaction> => {
    const response = await apiClient.get(`/recurring-transactions/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  update: async (
    id: string,
    userId: string,
    data: UpdateRecurringTransactionRequest,
  ): Promise<RecurringTransaction> => {
    const response = await apiClient.patch(
      `/recurring-transactions/${id}`,
      data,
      {
        params: { userId },
      },
    );
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/recurring-transactions/${id}`, {
      params: { userId },
    });
  },
};
