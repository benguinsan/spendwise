import { apiClient } from "@config/api";
import {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  PaginatedResponse,
} from "@types";

export const walletsApi = {
  create: async (data: CreateWalletRequest): Promise<Wallet> => {
    const response = await apiClient.post("/wallets", data);
    return response.data;
  },

  getAll: async (
    skip = 0,
    take = 10,
    userId?: string,
  ): Promise<PaginatedResponse<Wallet>> => {
    const response = await apiClient.get("/wallets", {
      params: { skip, take, ...(userId && { userId }) },
    });
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Wallet[]> => {
    const response = await apiClient.get(`/wallets/user/${userId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Wallet> => {
    const response = await apiClient.get(`/wallets/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateWalletRequest): Promise<Wallet> => {
    const response = await apiClient.patch(`/wallets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`);
  },
};
