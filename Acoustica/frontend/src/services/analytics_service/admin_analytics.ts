import api from '@/services/api';

export interface AdminDashboardSummary {
    total_users: number;
    active_users_7d: number;
    total_songs: number;
    total_playlists: number;
    total_streams: number;
    new_users_today: number;
    reports_pending: number;
    storage_used_mb: number;
}

export interface UserGrowthPoint {
    month_key: string;
    month: string;
    new_users: number;
}

export interface DailyStreamPoint {
    day: string;
    streams: number;
}

export interface PopularSong {
    song_id: number;
    title: string;
    plays: number;
    artist: string;
}

export interface PopularArtist {
    artist_id: number;
    artist: string;
    plays: number;
    songs: number;
}

export interface GenreDistributionPoint {
    genre: string;
    value: number;
}

export interface UserActivityPoint {
    metric: string;
    count: number;
}

export interface ModerationQueue {
    pending_reports: number;
    removed_songs: number;
    banned_users: number;
    flagged_content: number;
}

export interface GeographicStat {
    country: string;
    count: number;
}

export interface SystemHealth {
    server_status: string;
    db_status: string;
    db_latency_ms: number;
    storage_usage_percent: number;
    failed_requests_today: number;
}

export interface AdminDashboardData {
    summary: AdminDashboardSummary;
    user_growth: UserGrowthPoint[];
    daily_streams: DailyStreamPoint[];
    top_songs: PopularSong[];
    top_artists: PopularArtist[];
    genre_distribution: GenreDistributionPoint[];
    user_activity: UserActivityPoint[];
    moderation_queue: ModerationQueue;
    geographic_stats: GeographicStat[];
    system_health: SystemHealth;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
    return api.request<AdminDashboardData>('/api/admin/analytics/dashboard');
}
