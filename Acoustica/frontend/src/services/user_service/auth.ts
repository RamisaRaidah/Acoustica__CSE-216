import api from '@/services/api';

interface SignInResponse{
    message: string; 
    token: string;
    user_id: number;
    user_type: 'listener' | 'artist' | 'admin';
    theme: string;
    onboarding_done: boolean,
    listener_type: "free" | "premium" | undefined;
}

interface SignUpResponse{
    message: string;
    user_id: number;
    user_type: 'listener'|'artist';
}

interface SignOutResponse{
    message: string;
}

interface OnboardingResponse{
    message: string;
}

export async function signIn(email:string, password:string): 
Promise<SignInResponse> {
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

export async function onboarding(formData: FormData):
Promise<OnboardingResponse> {
    return api.request<OnboardingResponse>('/api/users/me/onboarding', {
        method: 'POST',
        body: formData
    });
}

export async function signOut():
Promise<SignOutResponse> {
    return api.request<SignOutResponse>('/api/auth/sign-out', { 
        method: 'POST' 
    });
}  

export async function getMyProfilePicture(): Promise<{profile_picture: string}> {
    return api.request('/api/users/me/profile_picture');
}

export async function sendTheme(theme: string) {
    api.request('/api/users/me/settings/theme', {
        method: 'PATCH',
        body: JSON.stringify({'theme': theme})
    });
}