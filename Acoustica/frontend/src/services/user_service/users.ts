import api from '@/services/api';

interface GetLastListeningResponse {
    song_id: number,
    album_id: number,
    title: string,
    artist_name: string,
    progress: number
}

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export async function getLastListening(): Promise<GetLastListeningResponse> {
    return api.request('/api/listeners/me/last-listening');
}

export async function sendStreamHistory(segments: {}) {
    api.request('/api/listeners/me/stream-history', {
        method: 'POST',
        body: JSON.stringify(segments)
    });
}