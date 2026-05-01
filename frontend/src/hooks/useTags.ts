"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, tagService } from "@/services/tag.service";

interface UseTagsOptions {
  autoFetch?: boolean;
}

export function useTags(options: UseTagsOptions = {}) {
  const { autoFetch = true } = options;
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tagService.getAll();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTags();
    }
  }, [autoFetch, fetchTags]);

  const createTag = useCallback(async (data: Partial<Tag>) => {
    try {
      const newTag = await tagService.create(data);
      if (newTag) {
        setTags((prev) => [...prev, newTag]);
        return newTag;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const updateTag = useCallback(async (id: string, data: Partial<Tag>) => {
    try {
      const updated = await tagService.update(id, data);
      if (updated) {
        setTags((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        );
        return updated;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    try {
      const success = await tagService.delete(id);
      if (success) {
        setTags((prev) => prev.filter((t) => t.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  };
}
