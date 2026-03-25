import api from '@/services/api';

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

interface GetLastListeningResponse {
    song_id: number,
    progress: number
}

export interface DeleteMyAccountResponse{
    message:string;
}

export interface GetMyProfileResponse{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    bio: string;
    theme: string;
    profile_picture: string;
    user_type: string;
    country_name: string;
    language_name: string;
    listener_type: string;
    stage_name: string;
    bank_account: string;
}

interface MessageResponse {
    message: string;
}

export async function getLastListening(): Promise<GetLastListeningResponse> {
    return api.request('/api/listeners/me/last-listening');
}

export async function addStreamHistory(segments: {}) {
    api.request('/api/listeners/me/stream-history', {
        method: 'POST',
        body: JSON.stringify(segments)
    });
}


export async function getMyProfile(): Promise<GetMyProfileResponse> {
    return api.request<GetMyProfileResponse>('/api/users/me');
}

export async function getProfilePicture(userId: number): Promise<{profile_picture: string}> {
    return api.request(`/api/users/${userId}/profile_picture`);
}

export async function deleteMyAccount():Promise<DeleteMyAccountResponse>{
    return api.request<DeleteMyAccountResponse>('/api/users/me',{
        method: 'DELETE'
    });
}

export async function updateAccount(formData: FormData):
Promise<MessageResponse> {
    return api.request<MessageResponse>('/api/users/me', {
        method: 'PUT',
        body: formData
    });
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<MessageResponse> {
    return api.request<MessageResponse>('/api/users/change-password', {
        method: 'PATCH',
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
        }),
    })
}

export async function forgotPassword(
    email: string
): Promise<MessageResponse> {
    return api.request<MessageResponse>('/api/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<MessageResponse> {
    return api.request<MessageResponse>('/api/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({
            token,
            new_password: newPassword,
        }),
    });
}