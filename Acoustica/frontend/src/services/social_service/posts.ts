import api from "@/services/api.ts";


export interface CreateReportPayload {
    text: string;
    image?: File;
}

export interface CreateReportResponse {
    message: string;
    report_id: number;
    date_time: string;
}

export interface Report {
    report_id: number;
    author_id: number;
    first_name: string;
    last_name: string;
    email: string;
    text: string;
    image: string | null;
    date_time: string;
    asset_id: number;
    asset_type: 'user' | 'song' | 'playlist' | 'album' | 'product';
    typed_id: number;
    content_title: string | null;
    cover_picture: string | null;
    profile_pic: string | null;
}

export interface GetReportsResponse {
    reports: Report[];
}

export interface HandleReportPayload {
    action: 'dismiss' | 'remove_content';
    note?: string;
}

export interface HandleReportResponse {
    message: string;
    report_id: number;
}


export interface ActivityLog {
    activity_id: number;
    date_time: string;
    admin_first_name: string;
    admin_last_name: string;
    admin_email: string;
    admin_role: string;
    admin_picture: string | null;
    activity: string | null;
    verdict: string | null;
    report_id: number | null;
    asset_id: number | null;
    author_id: number | null;
    author_note: string | null;
    date_reported: string | null;
    admin_note: string | null;
}

export interface GetActivityLogsResponse {
    logs: ActivityLog[];
}


export async function createReport(
    assetId: number,
    payload: CreateReportPayload
): Promise<CreateReportResponse> {
    const formData = new FormData();
    formData.append('text', payload.text);
    if (payload.image) formData.append('image', payload.image);

    return api.request(`/api/reports/${assetId}`, {
        method: 'POST',
        body: formData,
    });
}

export async function getReports(
    assetId: number
): Promise<GetReportsResponse> {
    return api.request(`/api/reports/get/${assetId}`);
}

export async function handleUserReport(
    reportId: number,
    payload: HandleReportPayload
): Promise<HandleReportResponse> {
    return api.request(`/api/reports/handle/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export async function getAllReports(): Promise<GetReportsResponse> {
    return api.request('/api/reports');
}

export async function getAllAdminActivity(): Promise<GetActivityLogsResponse> {
    return api.request('/api/activity-logs');
}