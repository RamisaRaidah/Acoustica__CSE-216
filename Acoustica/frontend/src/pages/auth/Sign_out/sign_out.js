import api from '/src/services/api.js';
import router from '/src/utils/routers.js';

export async function renderSignOut() {
    try {
        await api.signOut();
    } catch (e) {
        
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate('/sign-in');
    }
}

