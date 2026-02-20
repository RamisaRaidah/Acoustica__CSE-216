import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import api from '/src/services/api.js'
import { exitAuthMode } from '/src/utils/helper.js';

export async function renderUploadSong() {
    exitAuthMode();
    const result = await fetch('/src/pages/music/upload_song/upload_song.html');
    const html = await result.text();

    document.getElementById('content').innerHTML = html;

    await Promise.all([
      loadSidebar(),
      loadTopbar()
    ]);

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
                throw new Error("Song upload failed");
            }
            
            form.reset();
        }
        catch (error) {
            console.error(error);
            alert("Failed to upload song")
        }
    });
}