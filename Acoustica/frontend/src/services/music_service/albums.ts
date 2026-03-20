import api from '@/services/api';

export async function createAlbum(formData: FormData) {
    return api.request('/api/music/albums', {
        method: 'POST',
        body: formData
    });
}

export interface GetAlbumsResponse {
    album_id: number;
    title: string;
}

export async function getAlbums(): Promise<GetAlbumsResponse[]> {
    return api.request('/api/music/albums/all');
}

export interface GetAlbumDetailsResponse {
    album_id: number;
    title: string;
    description: string;
    owner_id: number;
    owner_name: string;
    release_date: string;
    visibility: string;
    copyright_certificate: string;
}

export async function getAlbumDetails(albumId: number): Promise<GetAlbumDetailsResponse> {
    return api.request(`/api/music/albums/${albumId}`);
}

export interface GetAlbumCoverPictureResponse {
    cover_picture_url: string;
}

export async function getAlbumCoverPicture(albumId: number): Promise<GetAlbumCoverPictureResponse> {
    return api.request(`/api/music/albums/${albumId}/cover-picture`);
}

export interface GetMyAlbumsResponse {
    album_id: number;
    title: string;
}

export async function getMyAlbums(): Promise<GetMyAlbumsResponse[]> {
    return api.request('/api/music/albums/me');
}

export interface GetAlbumSongsResponse {
    song_id: number;
    album_id: number;
    title: string;
    album_name: string;
    artist_name: string;
    length: number;
    play_count: number;
}

export async function getAlbumSongs(albumId: number): Promise<GetAlbumSongsResponse[]> {
    return api.request(`/api/music/albums/${albumId}/songs`);
}

export async function deleteAlbum(albumId: number) {
    return api.request(`/api/music/albums/${albumId}`, {
        method: 'DELETE'
    })
}

export async function editAlbum(albumId: number, formData: FormData) {
    return api.request(`/api/music/albums/${albumId}`, {
        method: 'PUT',
        body: formData
    })
}

