import { getUser } from "/src/services/user.js"
import { loadListenerTopbar } from "/src/components/topbar/listener_topbar/listener_topbar.js";
import { loadArtistTopbar } from "/src/components/topbar/artist_topbar/artist_topbar.js";
import { loadAdminTopbar } from "/src/components/topbar/admin_topbar/admin_topbar.js";

export async function loadTopbar() {
    const userType = getUser().user_type;
    
    if (userType === "listener") {
        await loadListenerTopbar();
    }
    else if (userType === "artist") {
        await loadArtistTopbar();
    }
    else if (userType === "admin") {
        await loadAdminTopbar();
    }
}

export async function removeTopbar() {
    const topbar = document.getElementById('topbar');
    topbar.innerHTML = '';
    topbar.style.setProperty('display', 'none', 'important');
}