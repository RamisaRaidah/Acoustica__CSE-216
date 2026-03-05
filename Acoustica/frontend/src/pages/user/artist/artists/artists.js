import { loadTopbar } from "/src/components/topbar/topbar.js";
import { loadSidebar } from "/src/components/sidebar/sidebar.js";
import MusicPlayer from "/src/components/music_player/music_player.js";
import api from '/src/services/api.js';
import { enterApp } from "/src/utils/helper.js";
import { getArtists } from "/src/services/artist.js";

export async function renderArtists() {
    enterApp();
    
    const playerState = MusicPlayer.loadPlayerState();
    await Promise.all([
        loadSidebar(),
        loadTopbar(),
        MusicPlayer.loadMusicPlayer(playerState.songId, playerState.album_id, playerState.title, playerState.artist, playerState.progress, false)
    ]);

    const response = await fetch('/src/pages/user/artist/artists/artists.html');
    document.getElementById('content').innerHTML = await response.text();

    const artists = await getArtists();

    const artistGrid = document.getElementById('artist_grid');

    artists.forEach(artist => {
        const artistCard = document.createElement('div');
        artistCard.classList.add('artist_card');
        artistCard.innerHTML = `
            <div class="artist_card_cover">
                <img src="${artist.profile_picture_url}">
            </div>
            <div class="artist_card_info">
                <p class="artist_card_title">${artist.name}</p>
            </div>
        `;
        artistGrid.appendChild(artistCard);
    });
}