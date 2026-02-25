import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { loadMusicPlayer } from '/src/components/music_player/music_player.js';

export async function renderListenerDashboard() {
    await Promise.all([
      loadSidebar(),
      loadTopbar(),
      loadMusicPlayer(2, 0)
    ]);

    const result = await fetch('src/pages/user/listener/dashboard/dashboard.html');
    const html = await result.text();

    document.getElementById('content').innerHTML = html;

    content.style.overflowY = 'auto'; 
    content.style.overflowX = 'hidden'; 
    content.classList.add('dashboard-scroll');
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
}