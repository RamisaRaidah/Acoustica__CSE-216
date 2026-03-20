import api from '@/services/api';

export async function uploadSong(formData: FormData) {
    return api.request('/api/music/songs', {
        method: 'POST',
        body: formData
    });
}

export interface SongInfo {
    song_id: number;
    title: string;
    album_id: number;
    album_name: string;
    language_id: number;
    language: string;
    length: number;
    release_date: string;
    lyrics: string;
    visibility: string;
    copyright_certificate: string;
    play_count: number;
    owner_id: string;
    owner_name: string;
    collaborators: string[];
    genres: string[];
    moods: string[];
    instruments: string[];
}

// export async function getSongDetails(songId: number): Promise<SongInfo> {
//     return api.request()
// }

export interface GetSongAudioRespose {
    stream_url: string;
}

export async function getSongAudio(songId: number): Promise<GetSongAudioRespose> {
    return api.request(`/api/music/songs/${songId}/audio`);  
}

export async function updateSong(songId: number, formData: FormData) {
    return api.request(`/api/music/songs/${songId}`, {
        method: 'PUT',
        body: formData
    })
}

export async function deleteSong(songId: number) {
    return api.request(`/api/music/songs/${songId}`, {
        method: 'DELETE'
    })
}