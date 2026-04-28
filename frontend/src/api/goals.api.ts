import { apiClient } from "@config/api";
import {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  PaginatedResponse,
  GoalSummary,
} from "@types";

export const goalsApi = {
  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post("/goals", data);
    return response.data;
  },

  getAll: async (
    userId: string,
    skip = 0,
    take = 10,
  ): Promise<PaginatedResponse<Goal>> => {
    const response = await apiClient.get("/goals", {
      params: { userId, skip, take },
    });
    return response.data;
  },

  getSummary: async (userId: string): Promise<GoalSummary> => {
    const response = await apiClient.get(`/goals/summary/${userId}`);
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Goal> => {
    const response = await apiClient.get(`/goals/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  update: async (
    id: string,
    userId: string,
    data: UpdateGoalRequest,
  ): Promise<Goal> => {
    const response = await apiClient.patch(`/goals/${id}`, data, {
      params: { userId },
    });
    return response.data;
  },

  addProgress: async (
    id: string,
    userId: string,
    amount: number,
  ): Promise<Goal> => {
    const response = await apiClient.post(
      `/goals/${id}/progress`,
      { amount },
      {
        params: { userId },
      },
    );
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`, {
      params: { userId },
    });
  },
};
