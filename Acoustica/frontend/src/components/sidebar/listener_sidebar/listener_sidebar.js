import { dashboard, playlists, artists } from '/src/utils/paths.js';

export async function loadListenerSidebar() {
    const sidebar = document.getElementById('sidebar');
    const response = await fetch('/src/components/sidebar/listener_sidebar/listener_sidebar.html');

    sidebar.innerHTML = await response.text();
    sidebar.style.setProperty('display', 'block', 'important');

    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica1.png');
    }
    else {
        document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica2.png');
    }

    // assigning paths
    document.getElementById('home_button').href = dashboard;
    document.getElementById('playlist_button').href = playlists;
    document.getElementById('artist_button').href = artists;
}