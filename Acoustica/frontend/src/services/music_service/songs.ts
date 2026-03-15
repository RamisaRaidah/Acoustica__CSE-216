import api from '@/services/api';

interface GetSongAudioRespose {
    stream_url: string;
}

export async function getSongAudio(songId: number): Promise<GetSongAudioRespose> {
    return api.request(`/api/music/songs/${songId}/audio`);  
}