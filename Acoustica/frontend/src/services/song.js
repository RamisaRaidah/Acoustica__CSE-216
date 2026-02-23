import api from '/src/services/api.js'

export async function getSongAudio(songId) {
    return api.request(`/api/music/songs/${songId}/audio`);  
}