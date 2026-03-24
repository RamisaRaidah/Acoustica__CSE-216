import api from '@/services/api';

export interface followResponse{
    message: string;
    is_following:boolean;
}

export async function followArtist(artist_id:number):Promise<followResponse>{
    console.log("Hello I am in services to call follow from backend!!!")
    return api.request<followResponse>(`/api/connections/${artist_id}/follow-artist`, {
        method: 'POST'
    });
}

export async function checkFollowStatus(artist_id:number):Promise<followResponse>{
    return api.request<followResponse>(`/api/connections/${artist_id}/follow-check-status`);
}