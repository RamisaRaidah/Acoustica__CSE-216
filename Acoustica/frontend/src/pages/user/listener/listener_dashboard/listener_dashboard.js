import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import MusicPlayer from '/src/components/music_player/music_player.js';

export async function renderListenerDashboard() {
  const playerState = MusicPlayer.loadPlayerState();
  await Promise.all([
    loadSidebar(),
    loadTopbar(),
    MusicPlayer.loadMusicPlayer(playerState.songId, playerState.title, playerState.artist, playerState.progress, false)
  ]);

  const response = await fetch('src/pages/user/listener/listener_dashboard/listener_dashboard.html');
  document.getElementById('content').innerHTML = await response.text();
}