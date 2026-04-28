import { apiClient } from "@config/api";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from "@types";

export const usersApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  getAll: async (skip = 0, take = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get("/users", {
      params: { skip, take },
    });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
