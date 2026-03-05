import api from '/src/services/api.js'

export async function getArtists() {
    return api.request('/api/artists', { method: 'GET' });
}