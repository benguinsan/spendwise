"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Transaction,
  transactionService,
} from "@/services/transaction.service";

interface UseTransactionsOptions {
  userId?: string;
  walletId?: string;
  autoFetch?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { userId, walletId, autoFetch = true } = options;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (walletId) {
        data = await transactionService.getByWallet(walletId);
      } else if (userId) {
        data = await transactionService.getByUser(userId);
      } else {
        data = await transactionService.getAll();
      }
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, walletId]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [autoFetch, fetchTransactions]);

  const createTransaction = useCallback(async (data: Partial<Transaction>) => {
    try {
      const newTransaction = await transactionService.create(data);
      if (newTransaction) {
        setTransactions((prev) => [...prev, newTransaction]);
        return newTransaction;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      try {
        const updated = await transactionService.update(id, data);
        if (updated) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
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

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const success = await transactionService.delete(id);
      if (success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
