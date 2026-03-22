import api from '@/services/api';

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

interface GetLastListeningResponse {
    song_id: number,
    album_id: number,
    title: string,
    artist_id: number;
    artist_name: string,
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

export interface GetMyProfileResponse{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    bio: string;
    theme: string;
    profile_picture: string;
    user_type: string;
    country_name: string;
    language_name: string;
    listener_type: string;
    stage_name: string;
    bank_account: string;
}

export async function getMyProfile(): Promise<GetMyProfileResponse> {
    return api.request<GetMyProfileResponse>('/api/users/me');
}

export async function getProfilePicture(userId: number): Promise<{profile_picture: string}> {
    return api.request(`/api/users/${userId}/profile_picture`);
}