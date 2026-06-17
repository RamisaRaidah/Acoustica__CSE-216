import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from 'recharts';
import { getAdminDashboardData, AdminDashboardData } from '@/services/analytics_service/admin_analytics';
import '@/pages/user/analytics/Admin_analytics.css';

// Sleek curated colors for charts
const COLORS = ['#f39c12', '#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#95a5a6'];

export default function AdminAnalytics() {
    const { theme } = useTheme();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const isDark = theme === 'dark';
    const textThemeColor = isDark ? '#f0f0f0' : '#1a1a1a';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        setError('');
        getAdminDashboardData()
            .then(res => {
                setData(res);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load administrative analytics dashboard data.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) {
        return <div className="loading">Loading</div>;
    }

    if (error || !data) {
        return <div className="error">{error || 'Failed to load analytics data'}</div>;
    }

    const {
        summary,
        user_growth,
        daily_streams,
        top_songs,
        top_artists,
        genre_distribution,
        user_activity,
        moderation_queue,
        geographic_stats,
        system_health
    } = data;

    return (
        <div className="analytics-container">
            <div className="dashboard-header">
                <h1>Admin Analytics Dashboard</h1>
                <p>Real-time telemetry, listener demographics, engagement trends, and moderation health.</p>
            </div>

            {/* TOP SUMMARY CARDS */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="card-icon-container">👤</div>
                    <div className="card-info">
                        <span className="card-label">Total Users</span>
                        <span className="card-value">{summary.total_users.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">⚡</div>
                    <div className="card-info">
                        <span className="card-label">Active (7d)</span>
                        <span className="card-value">{summary.active_users_7d.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">🎵</div>
                    <div className="card-info">
                        <span className="card-label">Total Songs</span>
                        <span className="card-value">{summary.total_songs.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">📁</div>
                    <div className="card-info">
                        <span className="card-label">Playlists</span>
                        <span className="card-value">{summary.total_playlists.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">▶️</div>
                    <div className="card-info">
                        <span className="card-label">Streams</span>
                        <span className="card-value">{summary.total_streams.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">📈</div>
                    <div className="card-info">
                        <span className="card-label">New Today</span>
                        <span className="card-value">+{summary.new_users_today}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">🚨</div>
                    <div className="card-info">
                        <span className="card-label">Reports</span>
                        <span className="card-value">{summary.reports_pending}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon-container">💾</div>
                    <div className="card-info">
                        <span className="card-label">Storage Used</span>
                        <span className="card-value">
                            {summary.storage_used_mb >= 1024
                                ? `${(summary.storage_used_mb / 1024).toFixed(2)} GB`
                                : `${summary.storage_used_mb.toFixed(1)} MB`}
                        </span>
                    </div>
                </div>
            </div>

            {/* CHARTS FULL GRID */}
            <div className="charts-full-grid">
                {/* 1. USER GROWTH CHART */}
                <div className="chart-card">
                    <h3 className="chart-card-title">📈 User Registrations Over Time</h3>
                    <div className="chart-container-inner">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={user_growth} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f39c12" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f39c12" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="month" stroke={textThemeColor} fontSize={12} />
                                <YAxis stroke={textThemeColor} fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                        borderColor: gridColor,
                                        borderRadius: '8px',
                                        color: textThemeColor
                                    }}
                                />
                                <Area type="monotone" dataKey="new_users" name="New Users" stroke="#f39c12" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. DAILY STREAMS CHART */}
                <div className="chart-card">
                    <h3 className="chart-card-title">🎵 Daily Stream Frequency (Last 15-30 Days)</h3>
                    <div className="chart-container-inner">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={daily_streams} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="day" stroke={textThemeColor} fontSize={11} />
                                <YAxis stroke={textThemeColor} fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                        borderColor: gridColor,
                                        borderRadius: '8px',
                                        color: textThemeColor
                                    }}
                                />
                                <Line type="monotone" dataKey="streams" name="Streams" stroke="#3498db" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. COL SPLIT: POPULAR SONGS & POPULAR ARTISTS */}
                <div className="split-grid-2col">
                    <div className="chart-card">
                        <h3 className="chart-card-title">🔥 Most Popular Songs</h3>
                        <div className="table-wrapper">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Song Title</th>
                                        <th>Artist</th>
                                        <th className="table-header-plays">Plays</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_songs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '2vh' }}>No songs logged.</td>
                                        </tr>
                                    ) : (
                                        top_songs.map((song, idx) => (
                                            <tr key={song.song_id || idx}>
                                                <td className="table-rank">#{idx + 1}</td>
                                                <td><strong>{song.title}</strong></td>
                                                <td>{song.artist}</td>
                                                <td className="table-plays">{song.plays.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-card-title">👑 Top Artists</h3>
                        <div className="table-wrapper">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Artist Name</th>
                                        <th>Songs Count</th>
                                        <th className="table-header-plays">Total Plays</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_artists.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '2vh' }}>No artists logged.</td>
                                        </tr>
                                    ) : (
                                        top_artists.map((artist, idx) => (
                                            <tr key={artist.artist_id || idx}>
                                                <td className="table-rank">#{idx + 1}</td>
                                                <td><strong>{artist.artist}</strong></td>
                                                <td>{artist.songs}</td>
                                                <td className="table-plays">{artist.plays.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 4. COL SPLIT: GENRE DISTRIBUTION & USER ACTIVITY */}
                <div className="split-grid-2col">
                    <div className="chart-card">
                        <h3 className="chart-card-title">🎧 Genre Distribution (Streams / Popularity)</h3>
                        <div className="chart-container-inner" style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genre_distribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="genre"
                                    >
                                        {genre_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                            borderColor: gridColor,
                                            borderRadius: '8px',
                                            color: textThemeColor
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-card-title">👥 User Activity Metrics (Daily / Weekly)</h3>
                        <div className="chart-container-inner" style={{ height: '260px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={user_activity} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis type="number" stroke={textThemeColor} fontSize={12} />
                                    <YAxis dataKey="metric" type="category" stroke={textThemeColor} fontSize={11} width={100} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                            borderColor: gridColor,
                                            borderRadius: '8px',
                                            color: textThemeColor
                                        }}
                                    />
                                    <Bar dataKey="count" name="Count" fill="#9b59b6" radius={[0, 4, 4, 0]}>
                                        {user_activity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 5. COL SPLIT: MODERATION QUEUE & SYSTEM HEALTH */}
                <div className="split-grid-2col">
                    <div className="chart-card">
                        <h3 className="chart-card-title">🚨 Moderation Command Panel</h3>
                        <div className="moderation-grid">
                            <div className="mod-card pending">
                                <div className="mod-info-sub">
                                    <span className="mod-title">Pending Reports</span>
                                </div>
                                <span className="mod-count pending-num">{moderation_queue.pending_reports}</span>
                            </div>

                            <div className="mod-card">
                                <div className="mod-info-sub">
                                    <span className="mod-title">Removed Content</span>
                                </div>
                                <span className="mod-count removed-num">{moderation_queue.removed_songs}</span>
                            </div>

                            <div className="mod-card">
                                <div className="mod-info-sub">
                                    <span className="mod-title">Banned Users</span>
                                </div>
                                <span className="mod-count">{moderation_queue.banned_users}</span>
                            </div>

                            <div className="mod-card">
                                <div className="mod-info-sub">
                                    <span className="mod-title">Flagged Content</span>
                                </div>
                                <span className="mod-count">{moderation_queue.flagged_content}</span>
                            </div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-card-title">💾 Infrastructure & System Health</h3>
                        <div className="system-health-list">
                            <div className="health-item">
                                <div className="health-label">🌐 Server Status</div>
                                <span className="status-badge healthy">
                                    <span className="pulse-circle"></span>
                                    {system_health.server_status}
                                </span>
                            </div>

                            <div className="health-item">
                                <div className="health-label">🗄️ Database Status</div>
                                <span className="status-badge healthy">
                                    <span className="pulse-circle"></span>
                                    {system_health.db_status}
                                </span>
                            </div>

                            <div className="health-item">
                                <div className="health-label">⚡ Database Latency</div>
                                <span className="health-value" style={{ color: system_health.db_latency_ms < 150 ? '#2ecc71' : '#e67e22' }}>
                                    {system_health.db_latency_ms} ms
                                </span>
                            </div>

                            <div className="health-item">
                                <div className="health-label">📦 Media Cloud Storage</div>
                                <span className="health-value">
                                    {system_health.storage_usage_percent}% capacity
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. GEOGRAPHIC STATISTICS (Optional) */}
                {geographic_stats && geographic_stats.length > 0 && (
                    <div className="chart-card">
                        <h3 className="chart-card-title">🌎 Geographic Listener Statistics</h3>
                        <div className="chart-container-inner" style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={geographic_stats} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="country" stroke={textThemeColor} fontSize={12} />
                                    <YAxis stroke={textThemeColor} fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                                            borderColor: gridColor,
                                            borderRadius: '8px',
                                            color: textThemeColor
                                        }}
                                    />
                                    <Bar dataKey="count" name="Users Count" fill="#1abc9c" radius={[4, 4, 0, 0]}>
                                        {geographic_stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
