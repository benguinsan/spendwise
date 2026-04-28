"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export default function NotificationsPage() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await api.notifications.getAll();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        addToast(
          `Failed to load notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [addToast]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      addToast("Notification marked as read", "success");
    } catch (error) {
      addToast(
        `Failed to mark notification as read: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      addToast("All notifications marked as read", "success");
    } catch (error) {
      addToast(
        `Failed to mark all as read: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      addToast("Notification deleted", "success");
    } catch (error) {
      addToast(
        `Failed to delete notification: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await api.notifications.deleteAll();
      setNotifications([]);
      addToast("All notifications deleted", "success");
    } catch (error) {
      addToast(
        `Failed to delete all notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 flex justify-between items-start transition-colors ${
                notification.isRead
                  ? "bg-muted/30 border-border"
                  : "bg-primary/5 border-primary/30"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      notification.type === "budget_alert"
                        ? "bg-red-100 text-red-800"
                        : notification.type === "goal_progress"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {notification.type === "budget_alert" && "💰 Budget Alert"}
                    {notification.type === "goal_progress" &&
                      "🎯 Goal Progress"}
                    {notification.type === "transaction" && "💳 Transaction"}
                    {!["budget_alert", "goal_progress", "transaction"].includes(
                      notification.type,
                    ) && notification.type}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <p className="text-sm text-foreground">
                  {notification.message}
                </p>
                {notification.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-xs px-2 py-1 bg-muted hover:bg-red-100 text-red-600 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="mt-4 px-4 py-2 text-sm text-muted-foreground hover:text-red-600 transition-colors"
            >
              Delete all notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
