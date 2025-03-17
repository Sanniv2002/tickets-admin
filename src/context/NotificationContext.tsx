import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Notification, NotificationContextType } from '../types/ticket';
import { getNotifications, markNotificationsAsRead } from '../services/api';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
    websocket: WebSocket;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, websocket }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation(); // Get current location

    useEffect(() => {
        // Fetch notifications only when on the dashboard
        if (location.pathname === '/dashboard') {
            fetchInitialNotifications();
        }
    }, [location.pathname]); // Trigger when pathname changes

    useEffect(() => {
        websocket.onmessage = (event) => {
            try {
                const notification: Notification = JSON.parse(event.data);
                addNotification(notification);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        return () => {
            websocket.onmessage = null;
        };
    }, [websocket]);

    const fetchInitialNotifications = async () => {
        try {
            const response = await getNotifications(1);
            setNotifications(response.notifications);
            setUnreadCount(response.notifications.filter((n) => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (ids: string[]) => {
        try {
            await markNotificationsAsRead(ids);
            setNotifications((prev) =>
                prev.map((notification) =>
                    ids.includes(notification._id) ? { ...notification, read: true } : notification
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - ids.length));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const addNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
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
