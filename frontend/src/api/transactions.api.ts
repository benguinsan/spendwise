import { apiClient } from "@config/api";
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PaginatedResponse,
} from "@types";

export const transactionsApi = {
  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post("/transactions", data);
    return response.data;
  },

  getAll: async (
    skip = 0,
    take = 10,
    filters?: {
      userId?: string;
      walletId?: string;
    },
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get("/transactions", {
      params: { skip, take, ...filters },
    });
    return response.data;
  },

  getByUserId: async (userId: string, limit = 20): Promise<Transaction[]> => {
    const response = await apiClient.get(`/transactions/user/${userId}`, {
      params: { limit },
    });
    return response.data;
  },

  getByWalletId: async (
    walletId: string,
    limit = 20,
  ): Promise<Transaction[]> => {
    const response = await apiClient.get(`/transactions/wallet/${walletId}`, {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateTransactionRequest,
  ): Promise<Transaction> => {
    const response = await apiClient.patch(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};
