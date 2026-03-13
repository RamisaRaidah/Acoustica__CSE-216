import { ListenerTopbar } from '@/components/topbar/listener_topbar/ListenerTopbar';
import { ArtistTopbar } from '@/components/topbar/artist_topbar/ArtistTopbar';
import { AdminTopbar } from '@/components/topbar/admin_topbar/AdminTopbar';
import { useAuth } from '@/contexts/AuthContext';

export function Topbar() {
    const { user } = useAuth();
    
    if (user?.user_type === "listener") return <ListenerTopbar />;
    else if (user?.user_type === "artist") return <ArtistTopbar />;
    else return <AdminTopbar />;
}