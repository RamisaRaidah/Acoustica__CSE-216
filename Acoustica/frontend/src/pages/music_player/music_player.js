import api from '../../services/api.js';

let isPlaying = false;
let currentSongId = null;

export async function renderMusic(params) {
    const contentContainer = document.getElementById('content');
    currentSongId = params.id ? parseInt(params.id) : 1;
    
    console.log('🎵 Loading song', currentSongId);
    
    contentContainer.innerHTML = '<p class="loading">Loading...</p>';

    try {
        const response = await fetch('/src/pages/music_player/music_player.html');
        const htmlTemplate = await response.text();    
        contentContainer.innerHTML = htmlTemplate;
        
        setTimeout(() => initPlayer(), 0);
    } catch (err) {
        console.error("Error:", err);
        contentContainer.innerHTML = '<p>Error loading player</p>';
    }
}

async function initPlayer() {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');
    const loadingText = document.getElementById('loadingText');

    if (!audio) {
        console.error('Audio element not found!');
        return;
    }

    loadingText.textContent = 'Loading...';

    try {
        console.log('Fetching song', currentSongId);
        
        // Get signed URL from backend
        const data = await api.get_song_audio(currentSongId);
        
        console.log('Got data:', data);
        
        // Set audio source
        audio.src = data.stream_url;
        
        loadingText.textContent = 'Ready!';
        
    } catch (error) {
        console.error('Failed:', error);
        loadingText.textContent = 'Error: ' + error.message;
        return;
    }

    // Play/Pause
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶';
            isPlaying = false;
        } else {
            audio.play();
            playBtn.textContent = '⏸';
            isPlaying = true;
        }
    });

    console.log('Player ready');
}