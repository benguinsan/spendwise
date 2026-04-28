import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { walletsApi } from "@api/wallets.api";
import {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  PaginatedResponse,
} from "@types";

export const useWallets = (
  userId?: string,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Wallet>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedResponse<Wallet>>({
    queryKey: ["wallets", userId],
    queryFn: () => walletsApi.getAll(0, 50, userId),
    enabled: !!userId,
    ...options,
  });
};

export const useUserWallets = (
  userId: string,
  options?: Omit<UseQueryOptions<Wallet[]>, "queryKey" | "queryFn">,
) => {
  return useQuery<Wallet[]>({
    queryKey: ["wallets", "user", userId],
    queryFn: () => walletsApi.getByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useWalletById = (
  id: string,
  options?: Omit<UseQueryOptions<Wallet>, "queryKey" | "queryFn">,
) => {
  return useQuery<Wallet>({
    queryKey: ["wallets", id],
    queryFn: () => walletsApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateWallet = () => {
  return useMutation({
    mutationFn: (data: CreateWalletRequest) => walletsApi.create(data),
  });
};

export const useUpdateWallet = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletRequest }) =>
      walletsApi.update(id, data),
  });
};

export const useDeleteWallet = () => {
  return useMutation({
    mutationFn: (id: string) => walletsApi.delete(id),
  });
};
