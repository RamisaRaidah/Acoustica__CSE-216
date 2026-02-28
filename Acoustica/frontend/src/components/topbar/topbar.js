    import api from '/src/services/api.js';
    import { loadMusicPlayer } from '/src/components/music_player/music_player.js';
    import router from '/src/utils/routers.js';

    export async function loadTopbar() {
        const topbar = document.getElementById('topbar');
        const result = await fetch('/src/components/topbar/topbar.html');
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
            document.getElementById('profile_picture_img').src = DEFAULT_PFP;
        }

        document.getElementById('toggle_button').addEventListener('click', ()=>{
            toggleAppMode();
        });

        function toggleAppMode() {
            const theme = localStorage.getItem('theme');
            document.body.classList.toggle('dark');
            if (theme === 'light') {
                localStorage.setItem('theme', 'dark');
                document.body.classList.add('dark');
                document.getElementById('app_name').setAttribute('src', '/src/assets/images/Deco/Acoustica2.png');
            }
            else {
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

            if (!result || result.length === 0) {
                closeDropdown();
                return;
            }

            dropdown.innerHTML = result.map(song => `
                <div class="search-item"  
                data-song-id="${song.song_id}"
                data-title="${song.title}">
                ${song.title}
                </div>
            `).join('');

            dropdown.classList.add('active');

            dropdown.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const songId = item.dataset.songId;
                    const title = item.dataset.title;
                    loadMusicPlayer(songId, title, 'Me', 0, true);
                    closeDropdown();
                    searchBar.value = '';
                });
            });
        }

        function closeDropdown() {
            const dropdown = document.getElementById('search_dropdown');
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
            router.navigate('/profile');
        });

        document.getElementById('signout_option').addEventListener('click', async (e) => {
            e.preventDefault();
            router.navigate('/sign-out');
        });


}

    export async function removeTopbar() {
        const topbar = document.getElementById('topbar');
        topbar.innerHTML = '';
        topbar.style.setProperty('display', 'none', 'important');
    }