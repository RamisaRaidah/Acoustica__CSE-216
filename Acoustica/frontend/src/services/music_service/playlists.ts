import api from '@/services/api';
import { SongInfo } from '@/services/music_service/songs';

export async function createPlaylist(formData: FormData) {
    return api.request('/api/music/playlists', {
        method: 'POST',
        body: formData
    });
}

export interface Playlist {
    playlist_id: number;
    title: string;
    cover_picture_url: string;
}

export async function getMyPlaylists(): Promise<Playlist[]> {
    return api.request('/api/music/playlists/me');
}

export async function getPopularPublicPlaylists(): Promise<Playlist[]> {
    return api.request('/api/music/playlists/popular_public_playlists');
}

export interface Playlist {
    playlist_id: number;
    title: string;
    description: string;
    creator_id: number;
    creation_date: string;
    cover_picture_url: string;
    visibility: string;
    view_count: number;
}

export async function getPlaylistDetails(playlistId: number): Promise<Playlist> {
    return api.request(`/api/music/playlists/${playlistId}`);
}

export async function getPlaylistSongs(playlistId: number): Promise<SongInfo[]> {
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

export async function likePlaylist(playlistId: number) {
    return api.request(`/api/music/playlists/${playlistId}/like`, {
        method: 'PUT'
    })
}

export async function isLiked(playlistId: number): Promise<boolean> {
    return api.request(`/api/music/playlists/${playlistId}/liked`);
}