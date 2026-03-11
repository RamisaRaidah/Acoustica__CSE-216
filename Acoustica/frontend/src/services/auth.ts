import api from './api.ts'

interface SignInResponse{
    message: string; 
    token: string;
    user_id: number;
    user_type: 'listener' | 'artist' | 'admin';
    theme: string;
    onboarding_done: boolean;
}

interface SignUpResponse{
    message: string;
    user_id: number;
    user_type: 'listener'|'artist';
}

interface SignOutResponse{
    message: string;
}

export async function signIn(email:string, password:string): Promise<SignInResponse> {
    return api.request<SignInResponse>('/api/auth/sign-in',{
        method: 'POST',
        body: JSON.stringify({email, password})
    });
}

export async function signUp(email:string, password:string, first_name:string, last_name:string, user_type:string):
Promise<SignUpResponse>{
    return api.request<SignUpResponse>('/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ email, password, first_name, last_name, user_type })
    });
}

export async function onboarding(formData: FormData) {
    return api.request('/api/users/me/onboarding', {
        method: 'POST',
        body: formData
    });
}

export async function signOut():Promise<SignOutResponse> {
    return api.request<SignOutResponse>('/api/auth/sign-out', { 
        method: 'POST' 
    });
}

export async function getCountries() {
    return api.request('/api/analytics/countries');
}

export async function getLanguages() {
    return api.request('/api/analytics/languages');
}

export async function getProfilePicture() {
    return api.request('/api/users/me/pfp');
}

export async function getMyProfile() {
    return api.request('/api/users/me');
}    