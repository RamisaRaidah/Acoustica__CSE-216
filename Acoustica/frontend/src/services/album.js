import api from '/src/services/api.js'

export async function getAlbums() {
    return api.request('/api/music/albums/all', { method: 'GET' });
}

export async function getAlbumDetails(albumId) {
    return api.request(`/api/music/albums/${albumId}`, { method: 'GET' });
}