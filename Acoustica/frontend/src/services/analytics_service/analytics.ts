import api from '@/services/api';

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

export async function getInstruments(): Promise<Instrument[]> {
    return api.request('/api/analytics/instruments');
}