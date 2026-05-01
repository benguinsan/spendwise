import { api } from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const notificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    try {
      const data = await api.notifications.getAll(userId);
      return Array.isArray(data) ? (data as Notification[]) : [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },

  async getSummary(userId: string): Promise<Notification[]> {
    try {
      const data = await api.notifications.getSummary(userId);
      return Array.isArray(data) ? (data as Notification[]) : [];
    } catch (error) {
      console.error("Failed to fetch notifications summary:", error);
      return [];
    }
  },

  async getOne(id: string, userId: string): Promise<Notification | null> {
    try {
      const data = await api.notifications.getOne(id, userId);
      return (data as Notification) || null;
    } catch (error) {
      console.error("Failed to fetch notification:", error);
      return null;
    }
  },

  async markAsRead(id: string, userId: string): Promise<boolean> {
    try {
      await api.notifications.markAsRead(id, userId);
      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await api.notifications.markAllAsRead(userId);
      return true;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  },

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      await api.notifications.delete(id, userId);
      return true;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  },

  async deleteAll(userId: string): Promise<boolean> {
    try {
      await api.notifications.deleteAll(userId);
      return true;
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      throw error;
    }
  },
};
