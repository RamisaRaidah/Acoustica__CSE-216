import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReports, Report } from '@/services/social_service/posts.ts';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import default_profile from '@/assets/images/Default_pfp.png';
import '@/pages/reports/Reports.css';

function formatDate(dt: string): string {
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

interface ReportRowProps {
    report: Report;
    index: number;
    onSongClick: (id: number) => void;
}

function ReportRow({ report, index, onSongClick }: ReportRowProps) {
    const [imgOpen, setImgOpen] = useState(false);
    const navigate = useNavigate();

    function handleContentClick() {
        switch (report.asset_type) {
            case 'song':     onSongClick(report.typed_id); break;
            case 'album':    navigate(`/music/albums/${report.typed_id}`); break;
            case 'playlist': navigate(`/music/playlists/${report.typed_id}`); break;
            case 'user':     navigate(`/artists/${report.typed_id}`); break;
            case 'product':  navigate(`/shop/products/${report.typed_id}`); break;
        }
    }

    return (
        <>
            <div className="rp-row" style={{ animationDelay: `${index * 60}ms` }}>

                <span className="rp-index">{index + 1}</span>

                {/* Clickable content cell */}
                <div className="rp-content rp-content--clickable" onClick={handleContentClick}>
                    <img
                        className="rp-content-cover"
                        src={report.cover_picture ?? default_cover}
                        alt={report.content_title ?? 'Content'}
                    />
                    <div className="rp-content-info">
                        <span className="rp-content-title">{report.content_title ?? '—'}</span>
                        <span className="rp-content-type">{report.asset_type}</span>
                    </div>
                </div>

                <div className="rp-author">
                    <img
                        className="rp-avatar"
                        src={default_profile}
                        alt={`${report.first_name} ${report.last_name}`}
                    />
                    <div className="rp-author-info">
                        <span className="rp-author-name">{report.first_name} {report.last_name}</span>
                        <span className="rp-author-email">{report.email}</span>
                    </div>
                </div>

                <div className="rp-note">
                    <p>{report.text}</p>
                </div>

                <div className="rp-image-cell">
                    {report.image ? (
                        <img
                            className="rp-thumb"
                            src={report.image}
                            alt="Attached"
                            onClick={() => setImgOpen(true)}
                        />
                    ) : (
                        <span className="rp-no-image">—</span>
                    )}
                </div>

                <span className="rp-time">{formatDate(report.date_time)}</span>

                <div className="rp-actions">
                    <button className="rp-actions-btn" aria-label="Actions">
                        Actions
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

            </div>

            {imgOpen && report.image && (
                <div className="rp-lightbox" onClick={() => setImgOpen(false)}>
                    <img src={report.image} alt="Report attachment" />
                </div>
            )}
        </>
    );
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

    useEffect(() => {
        getAllReports()
            .then(res => setReports(res.reports))
            .catch(() => setError('Failed to load reports.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">Loading</div>;
    if (error)   return <div className="error">{error}</div>;

    return (
        <div id="rp-container">

            <div className="rp-header">
                <h1>Reports</h1>
                <span className="rp-count">{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>
            </div>

            {reports.length === 0 ? (
                <p className="rp-empty">No reports filed yet.</p>
            ) : (
                <div className="rp-table">
                    <div className="rp-table-head">
                        <span>#</span>
                        <span>Content</span>
                        <span>Author</span>
                        <span>Note</span>
                        <span>Image</span>
                        <span>Time</span>
                        <span>Actions</span>
                    </div>
                    <div className="rp-table-body">
                        {reports.map((report, i) => (
                            <ReportRow
                                key={report.report_id}
                                report={report}
                                index={i}
                                onSongClick={setSelectedSongId}
                            />
                        ))}
                    </div>
                </div>
            )}

            {selectedSongId && (
                <SongProfile
                    isOpen={true}
                    onClose={() => setSelectedSongId(null)}
                    songId={selectedSongId}
                />
            )}
        </div>
    );
}