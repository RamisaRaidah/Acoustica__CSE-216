import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { getAlbums } from '/src/services/album.js';

export async function renderUploadSong() {
    const result = await fetch('/src/pages/music/song/upload_song/upload_song.html');
    const html = await result.text();

    document.getElementById('content').innerHTML = html;

    await Promise.all([
        loadTopbar(),
        loadSidebar()
    ]);

    const [languages, albums] = await Promise.all ([
        api.getLanguages(),
        getAlbums()
    ]);

    const create_album_button = document.getElementById('create_album_button');

    create_album_button.addEventListener('click', () => {
        router.navigate('/music/create-album');
    });

    document.getElementById('album_select').innerHTML = 
        `<option value="">Select an album</option>` +
        albums.map(c => `<option value="${c.album_id}">${c.title}</option>`).join('');

    document.getElementById('language_select').innerHTML = 
        `<option value="">Select language</option>` +
        languages.map(c => `<option value="${c.language_id}">${c.language_name}</option>`).join('');

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