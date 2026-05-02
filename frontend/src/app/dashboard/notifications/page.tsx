"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await api.notifications.getAll(user.id);
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

  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return;
    try {
      await api.notifications.markAsRead(id, user.id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      addToast("Notification marked as read", "success");
    } catch (error) {
      addToast(
        `Failed to mark as read: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.notifications.markAllAsRead(user.id);
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
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await api.notifications.delete(id, user.id);
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
    if (!user?.id) return;
    if (
      !confirm(
        "Are you sure you want to delete all notifications? This cannot be undone.",
      )
    )
      return;
    try {
      await api.notifications.deleteAll(user.id);
      setNotifications([]);
      addToast("All notifications deleted", "success");
    } catch (error) {
      addToast(
        `Failed to delete all notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "budget":
        return "💰";
      case "goal":
        return "🎯";
      case "transaction":
        return "💳";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
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
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Delete all
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "unread"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "read"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            {filter === "all"
              ? "No notifications yet."
              : filter === "unread"
                ? "No unread notifications."
                : "No read notifications."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-card border rounded-lg p-4 flex items-start gap-4 transition-all ${
                notification.isRead
                  ? "border-border opacity-70"
                  : "border-primary/50 shadow-sm"
              }`}
            >
              <div className="text-3xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p
                      className={`text-sm ${notification.isRead ? "text-muted-foreground" : "font-medium"}`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {notification.type}
                      </span>
                      {notification.createdAt && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
