import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationDropdown() {
    const { notifications } = useNotifications();

    return (
        <div className="notification-dropdown">
            <div className="notification-dropdown-header">
                <h3>Notifications</h3>
            </div>
            {notifications.length === 0 ? (
                <div className="notification-empty">
                    <span>🔔</span>
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map(n => (
                        <NotificationItem key={n.notification_id} notification={n} />
                    ))}
                </div>
            )}
        </div>
    );
}