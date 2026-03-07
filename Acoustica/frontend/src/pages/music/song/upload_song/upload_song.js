import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { getAlbums } from '/src/services/album.js';
import { getArtists } from '/src/services/artist.js';
import { getGenres, getMoods, getInstruments } from '/src/services/analytics.js';
import { enterApp } from '/src/utils/helper.js';

export async function renderUploadSong() {
    enterApp();
    loadSidebar();
    loadTopbar();

    const response = await fetch('/src/pages/music/song/upload_song/upload_song.html');
    document.getElementById('content').innerHTML = await response.text();

    const [albums, artists, languages, genres, moods, instruments] = await Promise.all ([
        getAlbums(),
        getArtists(),
        api.getLanguages(),
        getGenres(),
        getMoods(),
        getInstruments()
    ]);

    const new_album_button = document.getElementById('new_album_button');

    if(!new_album_button) {
        console.log('create album button not found');
    }

    new_album_button.addEventListener('click', () => {
        router.navigate('/music/album/create-album');
    });

    document.getElementById('album_select').innerHTML = 
        `<option value="">Select an album</option>` +
        albums.map(c => `<option value="${c.album_id}">${c.title}</option>`).join('');

    document.getElementById('collaborator_select').innerHTML =
        `<option value="">Select artist</option>` +
        artists.map(a => `<option value="${a.artist_id}">${a.artist_name}</option>`).join('');

    document.getElementById('language_select').innerHTML = 
        `<option value="">Select language</option>` +
        languages.map(c => `<option value="${c.language_id}">${c.language_name}</option>`).join('');

    document.getElementById('genre_select').innerHTML =
        `<option value="">Select genre</option>` +
        genres.map(g => `<option value="${g.genre_id}">${g.genre_name}</option>`).join('');

    document.getElementById('mood_select').innerHTML =
        `<option value="">Select mood</option>` +
        moods.map(m => `<option value="${m.mood_id}">${m.mood_name}</option>`).join('');

    document.getElementById('instrument_select').innerHTML =
        `<option value="">Select instrument</option>` +
        instruments.map(i => `<option value="${i.instrument_id}">${i.instrument_name}</option>`).join('');

    function setupCollaboratorMultiSelect() {
        const select = document.getElementById('collaborator_select');
        const roleSelect = document.getElementById('collaborator_role_select');
        const container = document.getElementById('selected_collaborators');
        const hiddenInput = document.getElementById('collaborators_input');

        const selected = new Map();

        select.addEventListener('change', () => {
            const id = select.value;
            const role = roleSelect.value;

            if (!id || !role || selected.has(`${id}:${role}`)) return;

            const text = `${select.options[select.selectedIndex].text} (${role})`;
            selected.set(`${id}:${role}`, text);

            const tag = document.createElement('div');
            tag.className = "tag";
            tag.dataset.id = `${id}:${role}`;
            tag.innerHTML = `${text} <span class="remove_tag">&times;</span>`;

            tag.querySelector('.remove_tag').addEventListener('click', () => {
                selected.delete(`${id}:${role}`);
                tag.remove();
                updateHidden();
            });

            container.appendChild(tag);
            updateHidden();

            select.value = '';
            roleSelect.value = '';
        });

        function updateHidden() {
            hiddenInput.value = Array.from(selected.keys()).join(',');
        }
    }

    function setupMultiSelect(selectId, containerId, hiddenInputId) {
        const select = document.getElementById(selectId);
        const container = document.getElementById(containerId);
        const hiddenInput = document.getElementById(hiddenInputId);

        const selected = new Map();

        select.addEventListener('change', () => {
            const id = select.value;
            const text = select.options[select.selectedIndex].text;
            if (!id || selected.has(id)) return;

            selected.set(id, text);

            const tag = document.createElement('div');
            tag.className = "tag";
            tag.dataset.id = id;
            tag.innerHTML = `${text} <span class="remove_tag">&times;</span>`;

            tag.querySelector('.remove_tag').addEventListener('click', () => {
                selected.delete(id);
                tag.remove();
                updateHidden();
            });

            container.appendChild(tag);
            updateHidden();

            select.value = '';
        });

        function updateHidden() {
            hiddenInput.value = Array.from(selected.keys()).join(',');
        }
    }

    setupCollaboratorMultiSelect();

    setupMultiSelect(
        'genre_select',
        'selected_genres',
        'genres_input'
    );

    setupMultiSelect(
        'mood_select',
        'selected_moods',
        'moods_input'
    );

    setupMultiSelect(
        'instrument_select',
        'selected_instruments',
        'instruments_input'
    );

    const form = document.getElementById('upload_song_form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await api.request('/api/music/songs', {
                method: 'POST',
                body: formData
            });

            if(response && response.message) {
                alert(response.message);
            }
            else {
                throw new Error(response.error);
            }
            
            form.reset();
        }
        catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    });
}