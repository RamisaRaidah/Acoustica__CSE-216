import ListenerSidebar from '@/components/sidebar/listener_sidebar/ListenerSidebar';
import ArtistSidebar from '@/components/sidebar/artist_sidebar/ArtistSidebar';
import AdminSidebar from '@/components/sidebar/admin_sidebar/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
    const { user } = useAuth();

    if (user?.user_type === "listener") return <ListenerSidebar />;
    else if (user?.user_type === "artist") return <ArtistSidebar />;
    else return <AdminSidebar />;
}