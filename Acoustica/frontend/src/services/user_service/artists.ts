import api from '@/services/api';

export interface Artist {
    artist_id: number;
    artist_name: string;
    profile_picture_url: string;
}

export interface GetArtistInfoResponse {
    artist_id: number;
    first_name: string;
    last_name: string;
    stage_name: string;
    bio: string;
    profile_picture_url: string;
    follower_count: number;
    song_count: number;
    monthly_listeners: number;
    is_following: boolean;
}

export async function getArtists(): Promise<Artist[]> {
    return api.request('/api/artists');
}

export async function getArtistInfo(artist_id: number):Promise<GetArtistInfoResponse> {
    return api.request<GetArtistInfoResponse>(`/api/artists/${artist_id}`);
}