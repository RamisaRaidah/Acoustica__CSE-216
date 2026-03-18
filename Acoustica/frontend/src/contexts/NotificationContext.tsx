import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
    notification_id: number;
    text: string;
    date_time: string;
    is_read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!user?.token) return;

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const es = new EventSource(`/api/notifications/stream?token=${user.token}`);

        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            } catch (err) {
                console.error('Failed to parse notification:', err);
            }
        };

        es.onerror = () => {
            es.close();
        };

        eventSourceRef.current = es;

        return () => {
            es.close();
        };
    }, [user?.token]);

    const markAllRead = async () => {
        if (!user?.token) return;
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setUnreadCount(0);
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (err) {
            console.error('Failed to mark notifications as read:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
    return ctx;
}