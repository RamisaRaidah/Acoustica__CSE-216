import { useEffect, useState } from 'react';
import { getAllAdminActivity,type ActivityLog } from '@/services/social_service/posts.ts';
import default_profile from '@/assets/images/Default_pfp.png';
import '@/pages/reports/activity-log/ActivityLog.css';

function formatDate(dt: string): string {
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const VERDICT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    dismiss:        { label: 'Dismissed',       color: '#a07850', bg: 'rgba(160,120,80,0.10)' },
    remove_content: { label: 'Content Removed', color: '#c0392b', bg: 'rgba(192,57,43,0.10)'  },
};

const ROLE_COLORS: Record<string, string> = {
    super_admin:   '#e07b2a',
    administrator: '#2980b9',
    moderator:     '#27ae60',
    analyst:       '#8e44ad',
    audit:         '#7f8c8d',
};

interface LogRowProps {
    log: ActivityLog;
    index: number;
}

function NoteCell({ text }: { text: string | null }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return <span className="al-no-value">—</span>;
    return (
        <div className="al-note">
            <p
                className={expanded ? 'al-note-expanded' : ''}
                title={text}
                onClick={() => setExpanded(p => !p)}
            >
                {text}
            </p>
        </div>
    );
}

function LogRow({ log, index }: LogRowProps) {
    const verdict = log.verdict
        ? (VERDICT_STYLES[log.verdict] ?? { label: log.verdict, color: '#888', bg: 'rgba(136,136,136,0.1)' })
        : null;
    const roleColor = ROLE_COLORS[log.admin_role] ?? '#888';

    


    return (
        <div className="al-row" style={{ animationDelay: `${index * 50}ms` }}>

            <span className="al-index">{index + 1}</span>

            <div className="al-admin">
                <img
                    className="al-avatar"
                    src={log.admin_picture ?? default_profile}
                    alt={`${log.admin_first_name} ${log.admin_last_name}`}
                />
                <div className="al-admin-info">
                    <span className="al-admin-name">{log.admin_first_name} {log.admin_last_name}</span>
                    <span className="al-admin-email">{log.admin_email}</span>
                    <span className="al-admin-role" style={{ color: roleColor }}>
                        {log.admin_role.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="al-activity">
                <span className="al-activity-type">{log.activity?.replace('_', ' ') ?? '—'}</span>
                {log.report_id && <span className="al-activity-meta">Report #{log.report_id}</span>}
                {log.asset_id  && <span className="al-activity-meta">Asset #{log.asset_id}</span>}
            </div>

            <div className="al-verdict-cell">
                {verdict ? (
                    <span
                        className="al-verdict-badge"
                        style={{ color: verdict.color, background: verdict.bg, borderColor: verdict.color + '40' }}
                    >
                        {verdict.label}
                    </span>
                ) : (
                    <span className="al-no-value">—</span>
                )}
            </div>
            

            <NoteCell text={log.author_note} />
            <NoteCell text={log.admin_note} />
            <span className="al-time">{formatDate(log.date_time)}</span>

        </div>
    );
}

export default function ActivityLog() {
    const [logs, setLogs]       = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        getAllAdminActivity()
            .then(res => setLogs(res.logs))
            .catch(() => setError('Failed to load activity logs.'))
            .finally(() => setLoading(false));
    }, []);

    
    if (loading) return <div className="loading">Loading</div>;
    if (error)   return <div className="error">{error}</div>;

    return (
        <div id="al-container">

            <div className="al-header">
                <h1>Activity Log</h1>
                <span className="al-count">{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</span>
            </div>

            {logs.length === 0 ? (
                <p className="al-empty">No admin activity recorded yet.</p>
            ) : (
                <div className="al-table">
                    <div className="al-table-head">
                        <span>#</span>
                        <span>Admin</span>
                        <span>Activity</span>
                        <span>Verdict</span>
                        <span>Reporter Note</span>
                        <span>Admin Note</span>
                        <span>Time</span>
                    </div>
                    <div className="al-table-body">
                        {logs.map((log, i) => (
                            <LogRow key={log.activity_id} log={log} index={i} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}