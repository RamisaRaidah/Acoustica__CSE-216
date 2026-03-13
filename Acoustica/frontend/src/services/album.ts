import api from '@/services/api';

interface GetAlbumsResponse {
    album_id: number;
    title: string;
}

interface GetAlbumDetailsResponse {
    album_id: number;
    asset_id: number;
    title: string;
    description: string;
    owner_id: number;
    release_date: string;
    visibility: string;
}

interface GetAlbumCoverPictureResponse {
    cover_picture_url: string;
}

export async function getAlbums(): Promise<GetAlbumsResponse[]> {
    return api.request('/api/music/albums/all', { method: 'GET' });
}

export async function getAlbumDetails(albumId: number): Promise<GetAlbumDetailsResponse> {
    return api.request(`/api/music/albums/${albumId}`, { method: 'GET' });
}

export async function getAlbumCoverPicture(albumId: number): Promise<GetAlbumCoverPictureResponse> {
    return api.request(`/api/music/albums/${albumId}/cover-picture`, { method: 'GET' });
}