import api from '@/services/api';

export interface GetArtistsResponse {
    artist_id: number;
    artist_name: string;
    profile_picture_url: string;
}

export async function getArtists(): Promise<GetArtistsResponse[]> {
    return api.request('/api/artists');
}