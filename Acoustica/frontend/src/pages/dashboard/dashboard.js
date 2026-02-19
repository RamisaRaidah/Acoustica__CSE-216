import { loadSidebar } from '../../components/sidebar/sidebar.js';
import { loadTopbar } from '../../components/topbar/topbar.js';
import { loadMusicPlayer } from '../../components/music_player/music_player.js';

export async function renderDashboard() {
    await Promise.all([
    loadSidebar(),
    loadTopbar(),
    loadMusicPlayer()
  ]);
}