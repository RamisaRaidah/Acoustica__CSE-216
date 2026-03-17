import api from '@/services/api';

export async function createPlaylist(formData: FormData) {
    return api.request('/api/music/playlists', {
        method: 'POST',
        body: formData
    });
}

export interface GetMyPlaylistsResponse {
    playlist_id: number;
    title: string;
    cover_picture_url: string;
}

export async function getMyPlaylists(): Promise<GetMyPlaylistsResponse[]> {
    return api.request('/api/music/playlists/me');
}