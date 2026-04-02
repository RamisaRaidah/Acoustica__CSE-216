import api from '@/services/api';
import { Genre, Mood, Instrument } from '@/services/analytics_service/analytics'

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
    album_title: string;
    language_id: number;
    language: string;
    length: number;
    release_date: string;
    play_count: number;
    owner_id: number;
    owner_name: string;
}


export interface GetArtistSongResponse {
    song_id: number;
    title: string;
    album_id: number | null;
    cover_picture_url: string | null;
}

export async function getSongMetadata(songId: number): Promise<SongInfo> {
    return api.request(`/api/music/songs/${songId}/metadata`);
}

export interface GetSongAudioRespose {
    stream_url: string;
}

export async function getSongAudio(songId: number): Promise<GetSongAudioRespose> {
    return api.request(`/api/music/songs/${songId}/audio`);  
}

export async function getSongLyrics(songId: number): Promise<{lyrics: string}> {
    return api.request(`/api/music/songs/${songId}/lyrics`);
}

export async function getSongCopyrightCertificate(songId: number): Promise<{copyright_certificate: string}> {
    return api.request(`/api/music/songs/${songId}/copyright_certificate`);
}

export interface Collaborator {
    artist_id: number;
    artist_name: string;
    role: string;
}

export async function getSongCollaborators(songId: number): Promise<Collaborator[]> {
    return api.request(`/api/music/songs/${songId}/collaborators`);
}

export async function getSongGenres(songId: number): Promise<Genre[]> {
    return api.request(`/api/music/songs/${songId}/genres`);
}

export async function getSongMoods(songId: number): Promise<Mood[]> {
    return api.request(`/api/music/songs/${songId}/moods`);
}

export async function getSongInstruments(songId: number): Promise<Instrument[]> {
    return api.request(`/api/music/songs/${songId}/instruments`);
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

export async function likeSong(songId: number) {
    return api.request(`/api/music/songs/${songId}/like`, {
        method: 'PUT'
    })
}

export async function isLiked(songId: number): Promise<boolean> {
    return api.request(`/api/music/songs/${songId}/liked`);
}

export async function getArtistSongs(artist_id: number): Promise<GetArtistSongResponse[]> {
    return api.request(`/api/music/songs/artists/${artist_id}`);
}

export async function getArtistCollaborationSongs(artist_id: number): Promise<GetArtistSongResponse[]> {
    return api.request(`/api/music/songs/collaboration/artists/${artist_id}`);
}
