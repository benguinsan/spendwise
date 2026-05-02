"use client";

import { useState, useEffect, useCallback } from "react";
import { Goal, goalService } from "@/services/goal.service";

interface UseGoalsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export function useGoals(options: UseGoalsOptions = {}) {
  const { userId, autoFetch = true } = options;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await goalService.getAll(userId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchGoals();
    }
  }, [autoFetch, fetchGoals, userId]);

  const createGoal = useCallback(async (data: Partial<Goal>) => {
    try {
      const newGoal = await goalService.create(data);
      if (newGoal) {
        setGoals((prev) => [...prev, newGoal]);
        return newGoal;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>) => {
      if (!userId) throw new Error("userId is required");
      try {
        const updated = await goalService.update(id, userId, data);
        if (updated) {
          setGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updated } : g)),
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

  const updateProgress = useCallback(
    async (id: string, amount: number) => {
      if (!userId) throw new Error("userId is required");
      try {
        const updated = await goalService.updateProgress(id, userId, amount);
        if (updated) {
          setGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updated } : g)),
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

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("userId is required");
      try {
        const success = await goalService.delete(id, userId);
        if (success) {
          setGoals((prev) => prev.filter((g) => g.id !== id));
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
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    updateProgress,
    deleteGoal,
  };
}
