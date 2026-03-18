import { Notification } from '@/contexts/NotificationContext';

interface NotificationItemProps {
    notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    };

    return (
        <div className={`notification-item ${!notification.is_read ? 'unread' : ''}`}>
            <div className="notification-dot" />
            <div className="notification-content">
                <p className="notification-text">{notification.text}</p>
                <span className="notification-time">{timeAgo(notification.date_time)}</span>
            </div>
        </div>
    );
}