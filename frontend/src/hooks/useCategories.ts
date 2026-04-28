import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { categoriesApi } from "@api/categories.api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  TransactionType,
} from "@types";

export const useCategories = (
  type?: TransactionType,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Category>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories", type],
    queryFn: () => categoriesApi.getAll(0, 100, type),
    ...options,
  });
};

export const useCategoriesByType = (
  type: TransactionType,
  options?: Omit<UseQueryOptions<Category[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Category[]>({
    queryKey: ["categories", "type", type],
    queryFn: () => categoriesApi.getByType(type),
    ...options,
  });
};

export const useDefaultCategories = (
  options?: Omit<UseQueryOptions<Category[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Category[]>({
    queryKey: ["categories", "defaults"],
    queryFn: () => categoriesApi.getDefaults(),
    ...options,
  });
};

export const useCategoryById = (
  id: string,
  options?: Omit<UseQueryOptions<Category>, "queryKey" | "queryFn">,
) => {
  return useQuery<Category>({
    queryKey: ["categories", id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
  });
};
