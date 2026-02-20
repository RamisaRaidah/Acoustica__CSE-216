import api from '../../services/api.js';

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/src/components/music_player/music_player.css";
document.head.appendChild(link);

let isPlaying = false;

export async function loadMusicPlayer(song_id, progress) {
  const result = await fetch('/src/components/music_player/music_player.html');
  const html = await result.text();

  document.getElementById('music_player').innerHTML = html;

  const audio = document.getElementById('audio');
  const playPauseBtn = document.getElementById('play_pause_button');
  const progressBar = document.getElementById('progress_bar');
  const totalTime = document.getElementById('total_time');
  const playTime = document.getElementById('play_time');

  if (!audio) {
    console.error('Audio element not found');
    return;
  }

  try {
    const response = await api.get_song_audio(song_id);
    audio.src = response.stream_url;
  }
  catch (error) {
    console.error(error.message);
  }

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = audio.duration * (progress / 100);
    progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
    playTime.innerText = formatTime(audio.currentTime);
    totalTime.innerText = formatTime(audio.duration);
  })

  audio.addEventListener('timeupdate', () => {
    progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
    playTime.innerText = formatTime(audio.currentTime);
  });

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      playPauseBtn.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
      isPlaying = false;
    }
    else {
      audio.play();
      playPauseBtn.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
      isPlaying = true;
    }
  });
}

export async function removeMusicPlayer() {
  document.getElementById('music_player').innerHTML = "";
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? "0" : "") + secs;
}