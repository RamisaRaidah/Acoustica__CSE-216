import api from '/src/services/api.js'

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export async function getLastListening() {
    return api.request('/api/listeners/me/last-listening', { method: 'GET' });
}