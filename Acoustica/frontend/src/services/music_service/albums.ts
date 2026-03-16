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
    asset_id: number;
    title: string;
    description: string;
    owner_id: number;
    release_date: string;
    visibility: string;
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