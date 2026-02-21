import { removeTopbar } from "/src/components/topbar/topbar.js";
import { removeSidebar } from "/src/components/sidebar/sidebar.js";
import api from '/src/services/api.js';

export async function renderCreateAlbum() {
    await Promise.all([
        removeTopbar(),
        removeSidebar()
    ]);

    const result = await fetch('/src/pages/music/song/create_album/create_album.html');
    const html = await result.text();

    document.getElementById('content').innerHTML = html;

    const form = document.getElementById('create_album_form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await api.request('/api/music/albums', {
                method: 'POST',
                body: formData
            });

            if (response && response.message) {
                alert(response.message);
            } 
            else {
                throw new Error(response.error);
            }
            
            form.reset();
        }
        catch (error) {
            console.error(error);
            alert(response.error)
        }
    });
}