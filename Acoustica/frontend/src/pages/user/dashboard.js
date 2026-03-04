import { getUser } from "/src/services/user.js"
import { renderListenerDashboard } from "/src/pages/user/listener/listener_dashboard/listener_dashboard.js";
import { renderArtistDashboard } from "/src/pages/user/artist/artist_dashboard/artist_dashboard.js";
import { renderAdminDashboard } from "/src/pages/user/admin/admin_dashboard/admin_dashboard.js";

export async function renderDashboard() {
    const userType = getUser().user_type;
    if (userType === "listener") {
        await renderListenerDashboard();
    }
    else if (userType === "artist") {
        await renderArtistDashboard();
    }
    else if (userType === "admin") {
        await renderAdminDashboard();
    }

    const content = document.getElementById('content');

    content.style.overflowY = 'auto'; 
    content.style.overflowX = 'hidden'; 
    content.classList.add('dashboard-scroll');
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
}