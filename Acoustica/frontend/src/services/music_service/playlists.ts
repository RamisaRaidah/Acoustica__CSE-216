import api from '@/services/api';

export interface GetMyPlaylistsResponse {
    playlist_id: number;
    title: string;
    cover_picture_url: string;
}

export async function getMyPlaylists(): Promise<GetMyPlaylistsResponse[]> {
    return api.request('/api/music/playlists/me');
}