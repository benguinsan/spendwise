"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Notification,
  notificationService,
} from "@/services/notification.service";

interface UseNotificationsOptions {
  userId?: string;
  autoFetch?: boolean;
  pollInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { userId, autoFetch = true, pollInterval = 30000 } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll(userId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!autoFetch || !userId) return;

    fetchNotifications();

    // Poll for new notifications
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [autoFetch, fetchNotifications, userId, pollInterval]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("userId is required");
      try {
        const success = await notificationService.markAsRead(id, userId);
        if (success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
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

  const markAllAsRead = useCallback(async () => {
    if (!userId) throw new Error("userId is required");
    try {
      const success = await notificationService.markAllAsRead(userId);
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [userId]);

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("userId is required");
      try {
        const success = await notificationService.delete(id, userId);
        if (success) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
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
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
