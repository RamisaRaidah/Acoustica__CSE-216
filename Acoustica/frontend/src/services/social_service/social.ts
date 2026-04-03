import api from '@/services/api';

export interface FamilySharedContent {
    family_shared_id: number;
    content_id: number;
    typed_id: number;
    sender_id: number;
    date_time: string;
    asset_type: 'song' | 'album' | 'playlist';
    sender_name: string;
    sender_profile_picture: string | null;
    content_title: string;
    cover_picture: string | null;
    note: string | null;
    artist_name: string | null;
}

export interface FamilySharedContentsResponse {
    family_name: string;
    data: FamilySharedContent[];
}

export interface UserFamily {
    family_id: number;
    family_name: string;
}

export async function getFamilySharedContents(familyId: number): Promise<FamilySharedContentsResponse> {
    return api.request(`/api/social/families/${familyId}/shares`);
}

export async function shareToFamily(
    familyId: number, 
    assetId: number, 
    note?: string
): Promise<{ message: string }> {
    return api.request(`/api/social/families/${familyId}/shares/${assetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
}

export async function getUserFamily(): Promise<UserFamily> {
    return api.request('/api/social/families/me');
}