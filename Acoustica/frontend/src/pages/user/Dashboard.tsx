import ListenerDashboard from '@/pages/user/listener/listener_dashboard/ListenerDashboard';
import ArtistDashboard from '@/pages/user/artist/artist_dashboard/ArtistDashboard';
import AdminDashboard from '@/pages/user/admin/admin_dashboard/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/sign-in" />;
    if (user?.user_type === "listener") return <ListenerDashboard />;
    else if (user?.user_type === "artist") return <ArtistDashboard />;
    else return <AdminDashboard />;
}