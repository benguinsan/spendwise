import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { goalsApi } from "@api/goals.api";
import {
  Goal,
  GoalSummary,
  CreateGoalRequest,
  UpdateGoalRequest,
  PaginatedResponse,
} from "@types";

export const useGoals = (
  userId: string,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Goal>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Goal>>({
    queryKey: ["goals", userId],
    queryFn: () => goalsApi.getAll(userId, 0, 50),
    enabled: !!userId,
    ...options,
  });
};

export const useGoalsSummary = (
  userId: string,
  options?: Omit<UseQueryOptions<GoalSummary>, "queryKey" | "queryFn">,
) => {
  return useQuery<GoalSummary>({
    queryKey: ["goals", "summary", userId],
    queryFn: () => goalsApi.getSummary(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useGoalById = (
  id: string,
  userId: string,
  options?: Omit<UseQueryOptions<Goal>, "queryKey" | "queryFn">,
) => {
  return useQuery<Goal>({
    queryKey: ["goals", id],
    queryFn: () => goalsApi.getById(id, userId),
    enabled: !!id && !!userId,
    ...options,
  });
};

export const useCreateGoal = () => {
  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalsApi.create(data),
  });
};

export const useUpdateGoal = () => {
  return useMutation({
    mutationFn: ({
      id,
      userId,
      data,
    }: {
      id: string;
      userId: string;
      data: UpdateGoalRequest;
    }) => goalsApi.update(id, userId, data),
  });
};

export const useAddGoalProgress = () => {
  return useMutation({
    mutationFn: ({
      id,
      userId,
      amount,
    }: {
      id: string;
      userId: string;
      amount: number;
    }) => goalsApi.addProgress(id, userId, amount),
  });
};

export const useDeleteGoal = () => {
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      goalsApi.delete(id, userId),
  });
};
