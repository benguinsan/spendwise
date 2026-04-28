import {
  useMutation,
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { transactionsApi } from "@api/transactions.api";
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PaginatedResponse,
} from "@types";

interface GetTransactionsFilters {
  userId?: string;
  walletId?: string;
  skip?: number;
  take?: number;
}

export const useTransactions = (
  filters: GetTransactionsFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Transaction>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ["transactions", filters],
    queryFn: () =>
      transactionsApi.getAll(filters.skip || 0, filters.take || 10, {
        userId: filters.userId,
        walletId: filters.walletId,
      }),
    enabled: !!filters.userId,
    ...options,
  });
};

export const useInfiniteTransactions = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["transactions", "infinite", userId],
    queryFn: ({ pageParam = 0 }) =>
      transactionsApi.getAll(pageParam, 20, { userId }),
    getNextPageParam: (lastPage) => {
      if (lastPage.skip + lastPage.take < lastPage.total) {
        return lastPage.skip + lastPage.take;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
};

export const useTransactionById = (
  id: string,
  options?: Omit<UseQueryOptions<Transaction>, "queryKey" | "queryFn">,
) => {
  return useQuery<Transaction>({
    queryKey: ["transactions", id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useUserTransactions = (
  userId: string,
  limit = 20,
  options?: Omit<UseQueryOptions<Transaction[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "user", userId],
    queryFn: () => transactionsApi.getByUserId(userId, limit),
    enabled: !!userId,
    ...options,
  });
};

export const useWalletTransactions = (
  walletId: string,
  limit = 20,
  options?: Omit<UseQueryOptions<Transaction[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "wallet", walletId],
    queryFn: () => transactionsApi.getByWalletId(walletId, limit),
    enabled: !!walletId,
    ...options,
  });
};

export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionsApi.create(data),
  });
};

export const useUpdateTransaction = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionRequest;
    }) => transactionsApi.update(id, data),
  });
};

export const useDeleteTransaction = () => {
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
  });
};
