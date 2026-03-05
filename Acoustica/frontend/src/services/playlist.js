import api from '/src/services/api.js'

export async function getMyPlaylists() {
    return api.request('/api/music/playlists/me', { method: 'GET' });
}