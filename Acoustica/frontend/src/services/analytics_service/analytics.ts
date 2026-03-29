import api from '@/services/api';
import { SongInfo } from '@/services/music_service/songs';
import { Artist } from '@/services/user_service/artists';

export interface Country {
    country_id:number;
    country_name:string;
}

export async function getCountries():Promise<Country[]> {
    return api.request('/api/analytics/countries');
}

export interface Language {
    language_id:number;
    language_name:string;
}

export async function getLanguages():Promise<Language[]> {
    return api.request('/api/analytics/languages');
} 

export interface Genre {
    genre_id: number;
    genre_name: string;
}

export async function getGenres(): Promise<Genre[]> {
    return api.request('/api/analytics/genres');
}

export interface Mood {
    mood_id: number;
    mood_name: string;
}

export async function getMoods(): Promise<Mood[]> {
    return api.request('/api/analytics/moods');
}

export interface Instrument {
    instrument_id: number;
    instrument_name: string;
}

export interface ArtistStats {
    top_songs: {
        song_id: number;
        title: string;
        play_count: number;
        cover_picture_url: string;
    }[];
    monthly_listeners: {
        month: string;
        listener_count: number;
    }[];
    total_plays: number;
}

export async function getInstruments(): Promise<Instrument[]> {
    return api.request('/api/analytics/instruments');
}

export async function getTrendingSongs(): Promise<SongInfo[]> {
    return api.request('/api/analytics/trending-songs');
}

export async function getPopularSongs(): Promise<SongInfo[]> {
    return api.request('/api/analytics/popular-songs');
}

export async function getTrendingArtists(): Promise<Artist[]> {
    return api.request('/api/analytics/trending-artists');
}

export async function getPopularArtists(): Promise<Artist[]> {
    return api.request('/api/analytics/popular-artists');
}

export async function getRecommendation(listenerId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/recommendation/listeners/${listenerId}`);
}

export async function getGenreTrendingSongs(genreId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/genre_trending_songs/${genreId}`);
}

export async function getGenrePopularSongs(genreId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/genre_popular_songs/${genreId}`);
}

export async function getGenreMySongs(genreId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/genre_my_songs/${genreId}`);
}

export async function getMoodTrendingSongs(moodId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/mood_trending_songs/${moodId}`);
}

export async function getMoodPopularSongs(moodId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/mood_popular_songs/${moodId}`);
}

export async function getMoodMySongs(moodId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/mood_my_songs/${moodId}`);
}

export async function getLanguageTrendingSongs(languageId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/language_trending_songs/${languageId}`);
}

export async function getLanguagePopularSongs(languageId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/language_popular_songs/${languageId}`);
}

export async function getLanguageMySongs(languageId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/language_my_songs/${languageId}`);
}

export async function getInstrumentTrendingSongs(instrumentId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/instrument_trending_songs/${instrumentId}`);
}

export async function getInstrumentPopularSongs(instrumentId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/instrument_popular_songs/${instrumentId}`);
}

export async function getInstrumentMySongs(instrumentId: number): Promise<SongInfo[]> {
    return api.request(`/api/analytics/instrument_my_songs/${instrumentId}`);
}

export async function getArtistStats(artist_id: number): Promise<ArtistStats> {
    return api.request<ArtistStats>(`/api/analytics/artists/${artist_id}/stats`);
}