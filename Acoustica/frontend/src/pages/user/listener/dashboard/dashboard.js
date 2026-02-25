import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { loadMusicPlayer } from '/src/components/music_player/music_player.js';
import { exitAuthMode } from '/src/utils/helper.js';

export async function renderDashboard() {
    // exitAuthMode();
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.style.display = 'block';

    await Promise.all([
      loadSidebar(),
      loadTopbar(),
      loadMusicPlayer(2, 0)
    ]);
}