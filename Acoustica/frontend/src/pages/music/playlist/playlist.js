import { loadTopbar } from "/src/components/topbar/topbar.js";
import { loadSidebar } from "/src/components/sidebar/sidebar.js";
import MusicPlayer from "/src/components/music_player/music_player.js";
import api from '/src/services/api.js';
import { create_playlist } from "/src/utils/paths.js";
import { enterApp } from "/src/utils/helper.js";
import { getMyPlaylists } from "/src/services/playlist.js";

export async function renderPlaylist() {
    enterApp();
    
    const playerState = MusicPlayer.loadPlayerState();
    await Promise.all([
        loadSidebar(),
        loadTopbar(),
        MusicPlayer.loadMusicPlayer(playerState.songId, playerState.album_id, playerState.title, playerState.artist, playerState.progress, false)
    ]);

    const response = await fetch('/src/pages/music/playlist/playlist.html');
    document.getElementById('content').innerHTML = await response.text();

    document.getElementById('create_playlist_button').href = create_playlist;

    const playlists = await getMyPlaylists();

    const playlistGrid = document.getElementById('playlist_grid');

    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.classList.add('playlist_card');
        playlistCard.innerHTML = `
            <div class="playlist_card_cover">
                <img src="${playlist.cover_picture_url}">
            </div>
            <div class="playlist_card_info">
                <p class="playlist_card_title">${playlist.title}</p>
            </div>
        `;
        playlistGrid.appendChild(playlistCard);
    });
}