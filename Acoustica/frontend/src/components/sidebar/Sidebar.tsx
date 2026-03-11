import ListenerSidebar from '@/components/sidebar/listener_sidebar/ListenerSidebar';
import ArtistSidebar from '@/components/sidebar/artist_sidebar/ArtistSidebar';
import AdminSidebar from '@/components/sidebar/admin_sidebar/AdminSidebar';


interface SidebarProps {
    user_type: 'listener' | 'artist' | 'admin';
}

function Sidebar({ user_type }: SidebarProps) {
    const SidebarMap = {
        listener: <ListenerSidebar />,
        artist: <ArtistSidebar />,
        admin: <AdminSidebar />
    }

    return SidebarMap[user_type];
}

export default Sidebar;