"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, walletService } from "@/services/wallet.service";

interface UseWalletsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export function useWallets(options: UseWalletsOptions = {}) {
  const { userId, autoFetch = true } = options;
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = userId
        ? await walletService.getByUser(userId)
        : await walletService.getAll();
      setWallets(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      fetchWallets();
    }
  }, [autoFetch, fetchWallets]);

  const createWallet = useCallback(async (data: Partial<Wallet>) => {
    try {
      const newWallet = await walletService.create(data);
      if (newWallet) {
        setWallets((prev) => [...prev, newWallet]);
        return newWallet;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateWallet = useCallback(
    async (id: string, data: Partial<Wallet>) => {
      try {
        const updated = await walletService.update(id, data);
        if (updated) {
          setWallets((prev) =>
            prev.map((w) => (w.id === id ? { ...w, ...updated } : w)),
          );
          return updated;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [],
  );

  const deleteWallet = useCallback(async (id: string) => {
    try {
      const success = await walletService.delete(id);
      if (success) {
        setWallets((prev) => prev.filter((w) => w.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    wallets,
    isLoading,
    error,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}
