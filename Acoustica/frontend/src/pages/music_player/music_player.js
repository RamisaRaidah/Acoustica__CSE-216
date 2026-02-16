import api from '../../services/api.js';
import { createNavbar } from '../../components/index.js';

// ===== CONFIGURATION =====
const SONG_URL = 'https://acoustica-media-storage.s3.eu-central-003.backblazeb2.com/Songs/Aadat.mp3';

const songData = {
    title: 'Aadat',
    artist: 'Atif Aslam',
    duration: null
};

// ===== STATE =====
let isPlaying = false;
let currentVolume = 1.0;

// ===== MAIN RENDER FUNCTION =====
export async function renderMusic() {
  const navbarContainer = document.getElementById('navbar');
  const contentContainer = document.getElementById('content');
  
  navbarContainer.innerHTML = createNavbar('music');
  contentContainer.innerHTML = '<p class="loading">Loading Acoustica Engine...</p>';

  try {
    const response = await fetch('/src/pages/music_player/music_player.html');
    const htmlTemplate = await response.text();    
    contentContainer.innerHTML = htmlTemplate;
    
    // Wait a bit for DOM to be ready, then initialize
    setTimeout(() => {
      initPlayer();
    }, 0);
    
  } catch (err) {
    console.error("Connection failed:", err);
    contentContainer.innerHTML = `
      <div class="error-container">
        <strong>Connection Error:</strong> Could not load music player.
      </div>
    `;
  }
}

// ===== INITIALIZATION =====
function initPlayer() {
    // Get all elements AFTER they're in the DOM
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const loadingText = document.getElementById('loadingText');

    // Check if elements exist
    if (!audio || !playBtn) {
        console.error('Player elements not found!');
        return;
    }

    // Set audio source
    audio.src = SONG_URL;
    
    // Set song info
    songTitle.textContent = songData.title;
    songArtist.textContent = songData.artist;
    
    // Set initial volume
    audio.volume = currentVolume;
    
    loadingText.textContent = 'Loading audio...';

    // ===== PLAY/PAUSE =====
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }

    playBtn.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => {
        isPlaying = true;
        playBtn.textContent = '⏸';
        loadingText.textContent = '';
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        playBtn.textContent = '▶';
    });

    // ===== PROGRESS BAR =====
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
        loadingText.textContent = 'Ready to play';
    });

    // Click on progress bar to seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // ===== VOLUME CONTROL =====
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audio.volume = volume;
        currentVolume = volume;
        
        // Update icon
        if (volume === 0) {
            volumeIcon.textContent = '🔇';
        } else if (volume < 0.5) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    });

    // Click volume icon to mute/unmute
    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.textContent = '🔇';
        } else {
            audio.volume = currentVolume;
            volumeSlider.value = currentVolume * 100;
            volumeIcon.textContent = '🔊';
        }
    });

    // ===== SKIP BUTTONS =====
    prevBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    nextBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    // ===== KEYBOARD CONTROLS =====
    document.addEventListener('keydown', handleKeyboard);
    
    function handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                break;
            case 'ArrowRight':
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                break;
            case 'ArrowUp':
                audio.volume = Math.min(1, audio.volume + 0.1);
                volumeSlider.value = audio.volume * 100;
                break;
            case 'ArrowDown':
                audio.volume = Math.max(0, audio.volume - 0.1);
                volumeSlider.value = audio.volume * 100;
                break;
        }
    }

    // ===== ERROR HANDLING =====
    audio.addEventListener('error', (e) => {
        loadingText.textContent = '❌ Error loading audio. Check URL.';
        console.error('Audio error:', e);
    });

    audio.addEventListener('canplay', () => {
        loadingText.textContent = '✅ Ready to play';
    });

    console.log('Music player initialized successfully');
}

// ===== UTILITY FUNCTIONS =====
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}