"use client";

import { useState, useEffect, useCallback } from "react";
import { Category, categoryService } from "@/services/category.service";

interface UseCategoriesOptions {
  type?: string;
  autoFetch?: boolean;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { type, autoFetch = true } = options;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = type
        ? await categoryService.getByType(type)
        : await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  const createCategory = useCallback(async (data: Partial<Category>) => {
    try {
      const newCategory = await categoryService.create(data);
      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
        return newCategory;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      try {
        const updated = await categoryService.update(id, data);
        if (updated) {
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
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

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const success = await categoryService.delete(id);
      if (success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
