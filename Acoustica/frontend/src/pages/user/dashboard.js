import { getUser } from "/src/services/user.js"
import { renderListenerDashboard } from "/src/pages/user/listener/listener_dashboard/listener_dashboard.js";
import { renderArtistDashboard } from "/src/pages/user/artist/artist_dashboard/artist_dashboard.js";
import { renderAdminDashboard } from "/src/pages/user/admin/admin_dashboard/admin_dashboard.js";
import { enterApp } from "/src/utils/helper.js";

export async function renderDashboard() {
    enterApp();

    const userType = getUser().user_type;
    const content = document.getElementById('content');
    const scrollbar = document.getElementById('scrollbar');

    if (userType === "listener") {
        content.style.height = '77vh';
        scrollbar.style.height = '77vh';
        await renderListenerDashboard();
    }
    else if (userType === "artist") {
        content.style.height = '89vh';
        scrollbar.style.height = '89vh';
        await renderArtistDashboard();
    }
    else if (userType === "admin") {
        content.style.height = '89vh';
        scrollbar.style.height = '89vh';
        await renderAdminDashboard();
    }
}