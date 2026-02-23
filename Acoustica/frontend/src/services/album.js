import api from '/src/services/api.js'

export async function getAlbums() {
    return api.request('/api/music/albums/0', { method: 'POST' });
}

export async function getAlbum(albumId) {
    return api.request(`/api/music/albums/${albumId}`, { method: 'POST' });
}