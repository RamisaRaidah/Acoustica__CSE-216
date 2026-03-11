import ListenerDashboard from '@/pages/user/listener/listener_dashboard/ListenerDashboard';
import ArtistDashboard from '@/pages/user/artist/artist_dashboard/ArtistDashboard';
import AdminDashboard from '@/pages/user/admin/admin_dashboard/AdminDashboard';


interface DashboardProps {
    user_type: 'listener' | 'artist' | 'admin';
}

function Dashboard({ user_type }: DashboardProps) {
    const dashboardMap = {
        listener: <ListenerDashboard />,
        artist: <ArtistDashboard />,
        admin: <AdminDashboard />
    }

    return dashboardMap[user_type];
}

export default Dashboard;