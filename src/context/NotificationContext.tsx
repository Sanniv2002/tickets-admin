import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationContextType } from '../types/ticket';
import { getNotifications } from '../services/api';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchInitialNotifications();
    setupWebSocket();
  }, []);

  const fetchInitialNotifications = async () => {
    try {
      const response = await getNotifications(1);
      setNotifications(response.notifications);
      setUnreadCount(response.notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(import.meta.env.VITE_NOTIFICATION_EVENT_URL);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      addNotification(notification);
    };

    ws.onclose = () => {
      setTimeout(setupWebSocket, 5000);
    };
  };

  const markAsRead = (ids: string[]) => {
    setNotifications(prev => 
      prev.map(notification => 
        ids.includes(notification._id) 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - ids.length));
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};