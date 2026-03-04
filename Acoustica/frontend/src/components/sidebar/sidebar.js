import { getUser } from "/src/services/user.js"
import { loadListenerSidebar } from "/src/components/sidebar/listener_sidebar/listener_sidebar.js";
import { loadArtistSidebar } from "/src/components/sidebar/artist_sidebar/artist_sidebar.js";
import { loadAdminSidebar } from "/src/components/sidebar/admin_sidebar/admin_sidebar.js";

export async function loadSidebar() {
    const userType = getUser().user_type;
    if (userType === "listener") {
        await loadListenerSidebar();
    }
    else if (userType === "artist") {
        await loadArtistSidebar();
    }
    else if (userType === "admin") {
        await loadAdminSidebar();
    }
}

export async function removeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    sidebar.style.setProperty('display', 'none', 'important');
}