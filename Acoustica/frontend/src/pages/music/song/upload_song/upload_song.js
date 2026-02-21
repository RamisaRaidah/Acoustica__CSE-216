import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import api from '/src/services/api.js';
import router from '/src/utils/routers.js';

export async function renderUploadSong() {
    const result = await fetch('/src/pages/music/song/upload_song/upload_song.html');
    const html = await result.text();

    document.getElementById('content').innerHTML = html;

    await Promise.all([
        loadTopbar(),
        loadSidebar()
    ]);

    const create_album_button = document.getElementById('create_album_button');

    create_album_button.addEventListener('click', () => {
        router.navigate('/music/create-album');
    });

    const form = document.getElementById('upload_song_form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('song_title').value.trim();
        const file = document.getElementById('song_file').files[0];

        if(!title) {
            alert("Please enter a song title");
            return;
        }

        if(!file) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        try {
            const response = await api.request('/api/music/songs', {
                method: 'POST',
                body: formData
            });

            if(response && response.message) {
                alert("Song uploaded successfully");
            }
            else {
                throw new Error("Failed to upload song");
            }
            
            form.reset();
        }
        catch (error) {
            console.error(error);
            alert("Failed to upload song")
        }
    });
}