import { getSongAudio } from "/src/services/song.js";

let isPlaying = false;

export async function loadMusicPlayer(songId, progress) {
  const musicPlayer = document.getElementById('music_player');
  musicPlayer.style.setProperty('display', 'block', 'important');
  const response = await fetch('/src/components/music_player/music_player.html');
  document.getElementById('music_player').innerHTML = await response.text();

  const audio = document.getElementById('audio');
  const playPauseButton = document.getElementById('play_pause_button');
  const progressContainer = document.getElementById('progress_container');
  const progressBar = document.getElementById('progress_bar');
  const totalTime = document.getElementById('total_time');
  const playTime = document.getElementById('play_time');

  if (!audio) {
    console.error('Audio element not found');
    return;
  }

  try {
    const response = await getSongAudio(songId);
    audio.src = response.stream_url;
  }
  catch (error) {
    console.error(error.message);
  }

  audio.addEventListener('loadedmetadata', () => {
    if (!Number.isFinite(audio.duration)) return;

    playPauseButton.style.opacity = '1';
    playPauseButton.style.pointerEvents = 'auto';

    audio.currentTime = audio.duration * (progress / 100);
    progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
    playTime.innerText = formatTime(audio.currentTime);
    totalTime.innerText = formatTime(audio.duration);
  })

  audio.addEventListener('timeupdate', () => {
    if (!Number.isFinite(audio.duration)) return;

    progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
    playTime.innerText = formatTime(audio.currentTime);
  });

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  playPauseButton.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
      isPlaying = false;
    }
    else {
      audio.play();
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
      isPlaying = true;
    }
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
  });

  progressContainer.addEventListener('click', (e) => {
    updateTimeFromDrag(e);
  });

  progressContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    updateTimeFromDrag(e);

    const onMouseMove = (event) => updateTimeFromDrag(event);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  function updateTimeFromDrag(e) {
    if (!Number.isFinite(audio.duration)) return;

    const rect = progressContainer.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));
    audio.currentTime = (offsetX / rect.width) * audio.duration;
    progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
    playTime.innerText = formatTime(audio.currentTime);
    audio.play().then(() => {
      isPlaying = true;
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
    });
  }
}

export async function removeMusicPlayer() {
  const musicPlayer = document.getElementById('music_player');
  musicPlayer.innerHTML = '';
  musicPlayer.style.setProperty('display', 'none', 'important');
}