import api from "@/services/api.ts";

interface GetMyProfileResponse{
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

export async function getMyProfile(): Promise<GetMyProfileResponse> {
    return api.request<GetMyProfileResponse>('/api/users/me');
}