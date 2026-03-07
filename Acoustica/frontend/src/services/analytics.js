import api from '/src/services/api.js';

export async function getGenres() {
    return api.request(`/api/analytics/genres`, { method: 'GET' });
}

export async function getMoods() {
    return api.request(`/api/analytics/moods`, { method: 'GET' });
}

export async function getInstruments() {
    return api.request(`/api/analytics/instruments`, { method: 'GET' });
}