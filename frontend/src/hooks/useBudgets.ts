"use client";

import { useState, useEffect, useCallback } from "react";
import { Budget, budgetService } from "@/services/budget.service";

interface UseBudgetsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export function useBudgets(options: UseBudgetsOptions = {}) {
  const { userId, autoFetch = true } = options;
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = userId
        ? await budgetService.getByUser(userId)
        : await budgetService.getAll();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      fetchBudgets();
    }
  }, [autoFetch, fetchBudgets]);

  const createBudget = useCallback(async (data: Partial<Budget>) => {
    try {
      const newBudget = await budgetService.create(data);
      if (newBudget) {
        setBudgets((prev) => [...prev, newBudget]);
        return newBudget;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateBudget = useCallback(
    async (id: string, data: Partial<Budget>) => {
      try {
        const updated = await budgetService.update(id, data);
        if (updated) {
          setBudgets((prev) =>
            prev.map((b) => (b.id === id ? { ...b, ...updated } : b)),
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

  const deleteBudget = useCallback(async (id: string) => {
    try {
      const success = await budgetService.delete(id);
      if (success) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    budgets,
    isLoading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
