import api from '@/services/api';

export async function uploadSong(formData: FormData) {
    return api.request('/api/music/songs', {
        method: 'POST',
        body: formData
    });
}

export interface GetSongAudioRespose {
    stream_url: string;
}

export async function getSongAudio(songId: number): Promise<GetSongAudioRespose> {
    return api.request(`/api/music/songs/${songId}/audio`);  
}

export async function updateSong(songId: number) {
    return api.request(`/api/music/songs/${songId}`, {
        method: 'PUT'
    })
}

export async function deleteSong(songId: number) {
    return api.request(`/api/music/songs/${songId}`, {
        method: 'DELETE'
    })
}