import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { budgetsApi } from "@api/budgets.api";
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  PaginatedResponse,
} from "@types";

export const useBudgets = (
  userId: string,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Budget>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Budget>>({
    queryKey: ["budgets", userId],
    queryFn: () => budgetsApi.getAll(userId, 0, 50),
    enabled: !!userId,
    ...options,
  });
};

export const useBudgetsByUserMonth = (
  userId: string,
  month: number,
  year: number,
  options?: Omit<UseQueryOptions<Budget[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Budget[]>({
    queryKey: ["budgets", userId, month, year],
    queryFn: () => budgetsApi.getByUser(userId, month, year),
    enabled: !!userId,
    ...options,
  });
};

export const useBudgetById = (
  id: string,
  options?: Omit<UseQueryOptions<Budget>, "queryKey" | "queryFn">,
) => {
  return useQuery<Budget>({
    queryKey: ["budgets", id],
    queryFn: () => budgetsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateBudget = () => {
  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetsApi.create(data),
  });
};

export const useUpdateBudget = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      budgetsApi.update(id, data),
  });
};

export const useDeleteBudget = () => {
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
  });
};
