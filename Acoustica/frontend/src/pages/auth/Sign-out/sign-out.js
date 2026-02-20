import api from '../services/api.js';
import router from './routers.js';

export async function signOut() {
    try {
        await api.signOut();
    } catch (e) {
        
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate('/sign-in');
    }
}