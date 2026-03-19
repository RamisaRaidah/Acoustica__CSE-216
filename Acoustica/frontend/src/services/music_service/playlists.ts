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

export interface GetPlaylistDetailsResponse {
    playlist_id: number;
    asset_id: number;
    title: string;
    description: string;
    creation_date: string;
    cover_picture_url: string;
    visibility: string;
    view_count: number;
}

export async function getPlaylistDetails(playlistId: number): Promise<GetPlaylistDetailsResponse> {
    return api.request(`/api/music/playlists/${playlistId}`);
}

export interface GetPlaylistSongsResponse {
    song_id: number;
    album_id: number;
    title: string;
    album_name: string;
    artist_name: string;
    length: number;
}

export async function getPlaylistSongs(playlistId: number): Promise<GetPlaylistSongsResponse[]> {
    return api.request(`/api/music/playlists/${playlistId}/songs`);
}

export async function deletePlaylist(playlistId: number) {
    return api.request(`/api/music/playlists/${playlistId}`, {
        method: 'DELETE'
    })
}

export async function editPlaylist(playlistId: number, formData: FormData) {
    return api.request(`/api/music/playlists/${playlistId}`, {
        method: 'PUT',
        body: formData
    })
}