import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/types';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/api/client';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, [user, load]);

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => (prev || []).map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead();
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, is_read: true })));
  };

  const dismiss = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => (prev || []).filter((n) => n.id !== id));
  };

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss, refresh: load }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
