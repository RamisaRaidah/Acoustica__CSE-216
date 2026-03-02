import { getSongAudio } from "/src/services/song.js";

class MusicPlayer {
  constructor() {
    if (MusicPlayer._instance) {
      return MusicPlayer._instance;
    }
    MusicPlayer._instance = this;
    this.isPlaying = false;
    this.audio = null;
  }

  async loadMusicPlayer(songId = -1, title = null, artist = null, progress = 0, play = false) {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
      this.isPlaying = false;
    }

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
    const songName = document.getElementById('song_name');
    const artistName = document.getElementById('artist_name');

    if (songId === -1) return;

    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    this.audio = audio;

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
      songName.innerHTML = title;
      artistName.innerHTML = artist;
    });

    audio.addEventListener('timeupdate', () => {
      if (!Number.isFinite(audio.duration)) return;

      progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
      playTime.innerText = formatTime(audio.currentTime);

      this.savePlayerState({
        songId, title, artist,
        progress: (audio.currentTime / audio.duration) * 100,
        isPlaying: this.isPlaying
      });
    });

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + ":" + (secs < 10 ? "0" : "") + secs;
    };

    playPauseButton.addEventListener('click', () => {
      if (this.isPlaying) {
        audio.pause();
        playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
        this.isPlaying = false;
      }
      else {
        audio.play();
        playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
        this.isPlaying = true;
      }
      this.savePlayerState({
        songId, title, artist,
        progress: (audio.currentTime / audio.duration) * 100,
        isPlaying: this.isPlaying
      });
    });

    audio.addEventListener('ended', () => {
      this.isPlaying = false;
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
    });

    const updateTimeFromDrag = (e) => {
      if (!Number.isFinite(audio.duration)) return;

      const rect = progressContainer.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      offsetX = Math.max(0, Math.min(offsetX, rect.width));
      audio.currentTime = (offsetX / rect.width) * audio.duration;
      progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
      playTime.innerText = formatTime(audio.currentTime);
      audio.play().then(() => {
        this.isPlaying = true;
        playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
      });
    };

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

    if (play) {
      audio.play();
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
      this.isPlaying = true;
    }
  }

  removeMusicPlayer() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
      this.isPlaying = false;
    }

    this.removePlayerState();

    const musicPlayer = document.getElementById('music_player');
    musicPlayer.innerHTML = '';
    musicPlayer.style.setProperty('display', 'none', 'important');
  }

  loadPlayerState() {
    try {
      return JSON.parse(localStorage.getItem('music_player_state')) || {};
    }
    catch {
      return {};
    }
  }

  savePlayerState(data) {
    localStorage.setItem('music_player_state', JSON.stringify(data));
  }

  removePlayerState() {
    localStorage.removeItem('music_player_state');
  }
}

export default new MusicPlayer();