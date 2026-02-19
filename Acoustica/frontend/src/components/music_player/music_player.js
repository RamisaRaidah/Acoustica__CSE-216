const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/src/components/music_player/music_player.css";
document.head.appendChild(link);

export async function loadMusicPlayer() {
  const result = await fetch('/src/components/music_player/music_player.html');
  const html = await result.text();

  document.getElementById('music_player').innerHTML = html;
}

export async function removeMusicPlayer() {
    document.getElementById('music_player').innerHTML = "";
}