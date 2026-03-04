import api from '/src/services/api.js';
import MusicPlayer from '/src/components/music_player/music_player.js';
import router from '/src/utils/routers.js';

export async function loadListenerTopbar() {
    const topbar = document.getElementById('topbar');
    const result = await fetch('/src/components/topbar/listener_topbar/listener_topbar.html');
    topbar.innerHTML = await result.text();
    topbar.style.setProperty('display', 'block', 'important');

    const DEFAULT_PFP = '/src/assets/images/Default_pfp.png';

    try {
        const data = await api.getProfilePicture();
        const img = document.getElementById('profile_picture_img');
        img.src = data?.profile_picture_url ?? DEFAULT_PFP;
        img.onerror = () => { img.src = DEFAULT_PFP; };
    } catch (e) {
        console.error('Failed to load pfp:', e);
    }

    document.getElementById('toggle_button').addEventListener('click', ()=>{
        toggleAppMode();
    });

    function toggleAppMode() {
        const theme = localStorage.getItem('theme');
        document.body.classList.toggle('dark');
        if (theme === 'light') {
            api.request('/api/users/me/settings/theme', {
                method: 'PATCH',
                body: JSON.stringify({'theme': 'dark'})
            });
            localStorage.setItem('theme', 'dark');
            document.body.classList.add('dark');
            document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica2.png');
        }
        else {
            api.request('/api/users/me/settings/theme', {
                method: 'PATCH',
                body: JSON.stringify({'theme': 'light'})
            });
            localStorage.setItem('theme', 'light');
            document.body.classList.remove('dark');
            document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica1.png');
        }
    }

    const searchBar = document.getElementById('search_bar');
    let debounceTimer;

    searchBar.addEventListener('input', (q)=> {
        const query = q.target.value.trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async ()=> {
            const result = await fetchSearchResult(query);
            displaySearchResult(result);
        }, 300);
    });

    async function fetchSearchResult(q) {
        try {
            const data = await api.request(`/api/search?q=${encodeURIComponent(q)}`);
            return data;
        }
        catch (e) {
            console.error('search failed:', e);
            return null;
        }
    }

    function displaySearchResult(result) {
        const dropdown = document.getElementById('search_dropdown');
        if (!dropdown) return;
        
        if (!result || (!result.songs.length && !result.albums.length && !result.artists.length)) {
            closeDropdown();
            return;
        }

        let html = '';

        if (result.songs.length) {
            html += `<div class="search-section-header">Songs</div>`;
            html += result.songs.map(song => `
                <div class="search-item"
                    data-song-id="${song.song_id}"
                    data-album-id="${song.album_id}"
                    data-title="${song.title}"
                    data-artist="${song.artist}">
                    <span class="search-item-title">${song.title}</span>
                    <span class="search-item-artist">· ${song.artist}</span>
                </div>
            `).join('');
        }

        if (result.albums.length) {
            html += `<div class="search-section-header">Albums</div>`;
            html += result.albums.map(album => `
                <div class="search-item"
                    data-album-id="${album.album_id}"
                    data-title="${album.title}"
                    data-artist="${album.artist}">
                    <span class="search-item-title">${album.title}</span>
                    <span class="search-item-artist">· ${album.artist}</span>
                </div>
            `).join('');
        }

        if (result.artists.length) {
            html += `<div class="search-section-header">Artists</div>`;
            html += result.artists.map(artist => `
                <div class="search-item"
                    data-artist-id="${artist.user_id}"
                    data-name="${artist.name}">
                    <span class="search-item-title">${artist.name}</span>
                </div>
            `).join('');
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');

        dropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.songId) {
                    const songId = parseInt(item.dataset.songId);
                    const albumId = parseInt(item.dataset.albumId);
                    console.log(albumId);
                    const title = item.dataset.title;
                    const artist = item.dataset.artist;
                    MusicPlayer.loadMusicPlayer(songId, albumId, title, artist, 0, true);

                } else if (item.dataset.albumId) {
                    console.log('album clicked:', item.dataset.albumId); 

                } else if (item.dataset.artistId) {
                    console.log('artist clicked:', item.dataset.artistId); 
                }

                closeDropdown();
                searchBar.value = '';
            });
        });
    }

    function closeDropdown() {
        const dropdown = document.getElementById('search_dropdown');
        if (!dropdown) return;
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search_bar') && !e.target.closest('#search_dropdown')) {
            closeDropdown();
        }
    });

    
    const profileDropdown = document.getElementById('profile_dropdown');

    document.getElementById('profile_picture').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#profile_wrapper')) {
            profileDropdown.classList.add('hidden');
        }
    });

    document.getElementById('profile_option').addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.add('hidden');
        router.navigate('/myProfile');
    });

    document.getElementById('signout_option').addEventListener('click', async (e) => {
        e.preventDefault();
        router.navigate('/sign-out');
    });
}