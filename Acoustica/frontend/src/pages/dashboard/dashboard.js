import { loadSidebar } from '../../components/sidebar/sidebar.js';
import { loadTopbar } from '../../components/topbar/topbar.js';
import { loadMusicPlayer } from '../../components/music_player/music_player.js';

export async function renderDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.style.display = 'block';

    await Promise.all([
    loadSidebar(),
    loadTopbar(),
    loadMusicPlayer(1, 0)
  ]);
}