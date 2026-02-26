import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { loadMusicPlayer } from '/src/components/music_player/music_player.js';

export async function renderListenerDashboard() {
    await Promise.all([
      loadSidebar(),
      loadTopbar(),
      loadMusicPlayer(2, 0)
    ]);

    const response = await fetch('src/pages/user/listener/listener_dashboard/listener_dashboard.html');
    document.getElementById('content').innerHTML = await response.text();
}