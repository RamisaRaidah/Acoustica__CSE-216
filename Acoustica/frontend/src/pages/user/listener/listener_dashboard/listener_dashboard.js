import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { getLastListening } from '/src/services/user.js';
import MusicPlayer from '/src/components/music_player/music_player.js';
import { enterApp } from '/src/utils/helper.js';

export async function renderListenerDashboard() {
  enterApp();
  const lastListening = await getLastListening();
  MusicPlayer.savePlayerState({
    songId: lastListening['song_id'], 
    albumId: lastListening['album_id'],
    title: lastListening['title'],
    artist: lastListening['artist'],
    progress: lastListening['progress'], 
    isPlaying: false
  });
  await Promise.all([
    loadSidebar(),
    loadTopbar()
  ]);

  await MusicPlayer.loadMusicPlayer(lastListening['song_id'], lastListening['album_id'], lastListening['title'], lastListening['artist'], lastListening['progress'], false)

  const response = await fetch('src/pages/user/listener/listener_dashboard/listener_dashboard.html');
  document.getElementById('content').innerHTML = await response.text();
}