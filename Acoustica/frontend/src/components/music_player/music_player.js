import { getSongAudio } from "/src/services/song.js";
import { getAlbumCoverPicture } from "/src/services/album.js";
import api from '/src/services/api.js';

class MusicPlayer {
  constructor() {
    if (MusicPlayer._instance) {
      return MusicPlayer._instance;
    }
    MusicPlayer._instance = this;
    this.songId = null;
    this.isPlaying = false;
    this.audio = null;
    this.startTime = null;
    window.addEventListener('beforeunload', () => {
      this.endSegment();
      this.flushSegments();
    });
  }

  async loadMusicPlayer(songId = -1, albumId = -1, title = null, artist = null, progress = 0, play = false) {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
      this.isPlaying = false;
      this.endSegment();
      this.flushSegments();
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
    const coverPicture = document.getElementById('cover_picture');

    if (songId === -1) return;

    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    this.audio = audio;
    this.songId = songId;

    try {
      const songAudio = await getSongAudio(songId);
      const albumCoverpicture = await getAlbumCoverPicture(albumId);
      audio.src = songAudio.stream_url;
      coverPicture.src = albumCoverpicture.cover_picture_url;
    }
    catch (error) {
      console.error(error.message);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (!Number.isFinite(audio.duration)) return;

      playPauseButton.style.opacity = '1';
      playPauseButton.style.pointerEvents = 'auto';

      audio.currentTime = audio.duration * (progress / 100);
      this.startTime = audio.currentTime;
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
        songId, albumId, title, artist,
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
        this.endSegment();
      }
      else {
        audio.play();
        playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
        this.isPlaying = true;
        this.startSegment();
      }
      this.savePlayerState({
        songId, albumId, title, artist,
        progress: (audio.currentTime / audio.duration) * 100,
        isPlaying: this.isPlaying
      });
    });

    audio.addEventListener('ended', () => {
      this.isPlaying = false;
      playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Play_Button.png';
      this.endSegment();
    });

    const updateTimeFromDrag = (e) => {
      if (!Number.isFinite(audio.duration)) return;

      this.endSegment();
      const rect = progressContainer.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      offsetX = Math.max(0, Math.min(offsetX, rect.width));
      audio.currentTime = (offsetX / rect.width) * audio.duration;
      progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + "%";
      playTime.innerText = formatTime(audio.currentTime);
      audio.play().then(() => {
        this.isPlaying = true;
        playPauseButton.src = '/src/assets/images/Musicbar_Buttons/Pause_Button.png';
        this.startSegment();
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
      this.startSegment();
    }
  }

  removeMusicPlayer() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
      this.isPlaying = false;
      this.endSegment();
      this.flushSegments();
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

  startSegment() {
    if (this.startTime === null) {
      this.startTime = this.audio.currentTime;
    }
  }

  endSegment() {
    if (!this.audio || this.startTime === null) return;
    const endTime = this.audio.currentTime;
    const duration = endTime - this.startTime;
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    if (duration > 5) {
      const segments = JSON.parse(localStorage.getItem('stream_segments') || '[]');
      segments.push({'song_id': this.songId, 'datetime': new Date().toISOString(), 'duration': duration, 'progress': progress});
      localStorage.setItem('stream_segments', JSON.stringify(segments));
      if (segments.length >= 5) {
        this.flushSegments();
      }
    }
    this.startTime = null;
  }

  flushSegments() {
    const segments = JSON.parse(localStorage.getItem('stream_segments') || '[]');
    if (segments.length === 0) return;

    api.request('/api/listeners/me/stream-history', {
      method: 'POST',
      body: JSON.stringify(segments)
    });
    localStorage.removeItem('stream_segments');
  }
}

export default new MusicPlayer();