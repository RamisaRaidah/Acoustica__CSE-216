import { API_BASE_URL } from './config.js';

class ApiService {
    getToken(){
        return localStorage.getItem("token");
    }

    async request(endpoint, options = {}) {
        try {
            const token=this.getToken();

            const headers={ ...options.headers };

            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            if(token){
                headers['Authorization']=`Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers,
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } 
        catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async signIn(email, password) {
        return this.request('/api/auth/sign-in',{
            method: 'POST',
            body: JSON.stringify({email, password})
        });
    }

    async signUp(email, password, first_name, last_name, user_type) {
        return this.request('/api/auth/sign-up', {
            method: 'POST',
            body: JSON.stringify({ email, password, first_name, last_name, user_type })
        });
    }

    async onboarding(formData) {
        return this.request('/api/users/me/onboarding', {
            method: 'POST',
            body: formData
        });
    }

    async signOut() {
        return this.request('/api/auth/sign-out', { method: 'POST' });
    }

    async getCountries() {
        return this.request('/api/analytics/countries');
    }

    async getLanguages() {
        return this.request('/api/analytics/languages');
    }

    async getProfilePicture() {
        const cached = sessionStorage.getItem('pfp_url');
        const cachedTime = sessionStorage.getItem('pfp_time');
        
        if (cached && cachedTime && (Date.now() - Number(cachedTime) < 50 * 60 * 1000)) {
            return { profile_picture_url: cached };
        }

        const data = await this.request('/api/users/me/pfp');
        sessionStorage.setItem('pfp_url', data.profile_picture_url);
        sessionStorage.setItem('pfp_time', String(Date.now()));
        return data;
    }

    async getMyProfile() {
        return this.request('/api/users/me');
    }    
}

export default new ApiService();