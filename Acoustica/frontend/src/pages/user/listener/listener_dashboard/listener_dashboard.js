import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { getLastListening } from '/src/services/user.js';
import MusicPlayer from '/src/components/music_player/music_player.js';

export async function renderListenerDashboard() {
  const lastListening = await getLastListening();
  MusicPlayer.savePlayerState({
    songId: lastListening['song_id'], 
    albumId: lastListening['album_id'],
    title: lastListening['title'],
    artist: lastListening['artist'],
    progress: lastListening['progress'], 
    isPlaying: false
  });

  const playerState = MusicPlayer.loadPlayerState();
  console.log(playerState);

  await Promise.all([
    loadSidebar(),
    loadTopbar(),
    MusicPlayer.loadMusicPlayer(playerState['song_id'], playerState['album_id'], playerState['title'], playerState['artist'], playerState['progress'], false)
  ]);
  
  const response = await fetch('/src/pages/user/listener/listener_dashboard/listener_dashboard.html');
  document.getElementById('content').innerHTML = await response.text();
}