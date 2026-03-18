import { useRef, useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext.tsx';
import NotificationDropdown from '@/components/notifications/NotificationDropdown.tsx';
import notification_button_img from '@/assets/images/Topbar_Buttons/Notification_Button.png';
import '@/components/notifications/Notifications.css';

export default function Notifications() {
    const { unreadCount, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleBellClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const opening = !open;
        setOpen(opening);
        if (opening && unreadCount > 0) {
            markAllRead();
        }
    };

    return (
        <div className="notification-bell-wrapper" ref={wrapperRef}>
            <div className="notification-bell" onClick={handleBellClick}>
                <img src={notification_button_img} className="icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            {open && <NotificationDropdown />}
        </div>
    );
}