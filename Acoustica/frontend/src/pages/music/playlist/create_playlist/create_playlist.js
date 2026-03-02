import { loadTopbar } from "/src/components/topbar/topbar.js";
import { loadSidebar } from "/src/components/sidebar/sidebar.js";
import MusicPlayer from "/src/components/music_player/music_player.js";
import api from '/src/services/api.js';

export async function renderCreatePlaylist() {
    const playerState = MusicPlayer.loadPlayerState();
    await Promise.all([
        loadSidebar(),
        loadTopbar(),
        MusicPlayer.loadMusicPlayer(playerState.songId, playerState.title, playerState.artist, playerState.progress, false)
    ]);

    const response = await fetch('/src/pages/music/playlist/create_playlist/create_playlist.html');
    document.getElementById('content').innerHTML = await response.text();

    const form = document.getElementById('create_playlist_form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await api.request('/api/music/playlists', {
                method: 'POST',
                body: formData
            });

            if (response && response.message) {
                alert(response.message);
            } 
            else {
                throw new Error(response.error);
            }
            
            form.reset();
        }
        catch (error) {
            console.error(error);
            alert(error)
        }
    });
}