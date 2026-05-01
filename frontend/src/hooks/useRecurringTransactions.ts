"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RecurringTransaction,
  recurringTransactionService,
} from "@/services/recurring-transaction.service";

interface UseRecurringTransactionsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export function useRecurringTransactions(
  options: UseRecurringTransactionsOptions = {},
) {
  const { userId, autoFetch = true } = options;
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await recurringTransactionService.getAll(userId);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchTransactions();
    }
  }, [autoFetch, fetchTransactions, userId]);

  const createTransaction = useCallback(
    async (data: Partial<RecurringTransaction>) => {
      try {
        const newTransaction = await recurringTransactionService.create(data);
        if (newTransaction) {
          setTransactions((prev) => [...prev, newTransaction]);
          return newTransaction;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<RecurringTransaction>) => {
      if (!userId) throw new Error("userId is required");
      try {
        const updated = await recurringTransactionService.update(
          id,
          userId,
          data,
        );
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
    [userId],
  );

  const toggleTransaction = useCallback(
    async (id: string, isActive: boolean) => {
      if (!userId) throw new Error("userId is required");
      try {
        const success = await recurringTransactionService.toggle(
          id,
          userId,
          isActive,
        );
        if (success) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isActive } : t)),
          );
        }
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [userId],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("userId is required");
      try {
        const success = await recurringTransactionService.delete(id, userId);
        if (success) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        }
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [userId],
  );

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    toggleTransaction,
    deleteTransaction,
  };
}
