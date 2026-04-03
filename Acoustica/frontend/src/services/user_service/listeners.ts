import api from "@/services/api";

export interface GetLastListeningResponse {
    song_id: number,
    progress: number
}

export async function getLastListening(): Promise<GetLastListeningResponse> {
    return api.request('/api/listeners/me/last-listening');
}

export async function addStreamHistory(segments: {}) {
    api.request('/api/listeners/me/stream-history', {
        method: 'POST',
        body: JSON.stringify(segments)
    });
}

export async function getDailyStreamTime(): Promise<{stream_time: number}> {
    return api.request('/api/listeners/me/daily-stream-time');
}

export interface LikedSong {
    song_id: number;
    title: string;
    album_id: number;
    length: number;
    owner_id: number;
    owner_name: string;
}

export async function getLikedSongs(): Promise<LikedSong[]> {
    return api.request('/api/listeners/me/liked-songs');
}

export interface LikedAlbum {
    album_id: number;
    title: string;
    owner_id: number;
    owner_name: string;
}

export async function getLikedAlbums(): Promise<LikedAlbum[]> {
    return api.request('/api/listeners/me/liked-albums');
}

export interface LikedPlaylist {
    playlist_id: number;
    title: string;
    cover_picture_url: string;
}

export async function getLikedPlaylists(): Promise<LikedPlaylist[]> {
    return api.request('/api/listeners/me/liked-playlists');
}

export async function getRecentlyPlayed() {
    return api.request('/api/listeners/me/recently-played')
}

