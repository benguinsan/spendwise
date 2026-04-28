import { apiClient } from "@config/api";
import {
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
  PaginatedResponse,
  TagAnalytics,
  Transaction,
} from "@types";

export const tagsApi = {
  create: async (data: CreateTagRequest): Promise<Tag> => {
    const response = await apiClient.post("/tags", data);
    return response.data;
  },

  getAll: async (
    userId: string,
    skip = 0,
    take = 50,
  ): Promise<PaginatedResponse<Tag>> => {
    const response = await apiClient.get("/tags", {
      params: { userId, skip, take },
    });
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Tag> => {
    const response = await apiClient.get(`/tags/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  getTransactions: async (
    tagId: string,
    userId: string,
    skip = 0,
    take = 20,
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/tags/${tagId}/transactions`, {
      params: { userId, skip, take },
    });
    return response.data;
  },

  getAnalytics: async (
    tagId: string,
    userId: string,
  ): Promise<TagAnalytics> => {
    const response = await apiClient.get(`/tags/${tagId}/analytics`, {
      params: { userId },
    });
    return response.data;
  },

  update: async (
    id: string,
    userId: string,
    data: UpdateTagRequest,
  ): Promise<Tag> => {
    const response = await apiClient.patch(`/tags/${id}`, data, {
      params: { userId },
    });
    return response.data;
  },

  addToTransaction: async (
    tagId: string,
    transactionId: string,
    userId: string,
  ): Promise<void> => {
    await apiClient.post(`/tags/${tagId}/transactions/${transactionId}`, null, {
      params: { userId },
    });
  },

  removeFromTransaction: async (
    tagId: string,
    transactionId: string,
    userId: string,
  ): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}/transactions/${transactionId}`, {
      params: { userId },
    });
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/tags/${id}`, {
      params: { userId },
    });
  },
};
