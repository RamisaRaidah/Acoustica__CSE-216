import { useEffect, useState } from 'react';
import { getArtistStats } from '@/services/analytics_service/analytics';
import defaultCoverPic from '@/assets/images/music/Default_Cover_Picture.png';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';

interface TopSong {
    song_id: number;
    title: string;
    play_count: number;
    cover_picture_url: string;
}

interface StatsData {
    top_songs: TopSong[];
    monthly_listeners: { month: string; listener_count: number }[];
    total_plays: number;
}

interface Props {
    artist_id: number;
}

function ArtistStatsChart({ artist_id }: Props) {
    const { user } = useAuth();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
    const { playSong, addToQueue } = useMusic();

    useEffect(() => {
        loadStats();
    }, [artist_id]);

    const loadStats = async () => {
        try {
            const data = await getArtistStats(artist_id);
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    if (!stats || stats.top_songs.length === 0) return (
        <div className="artist-stats-wrapper">
            <h3 className="stats-heading">Top Songs</h3>
            <div className="artist-stats-chart artist-stats-empty">
                <p className="stats-empty-text">No songs yet</p>
            </div>
        </div>
    );

    const rowCount = !stats || stats.top_songs.length <= 2 ? 1 : 2;

    const maxPlays = stats.top_songs[0].play_count || 1;

    return (
        <div className="artist-stats-wrapper">
            <h3 className="stats-heading">Top Songs</h3>
            <div className="artist-stats-chart" data-rows={rowCount}>
                {stats.top_songs.map((song) => (
                    <div key={song.song_id} className="song-stat-item">
                        <div 
                            className="song-cover-wrapper"
                            onClick={() => { 
                                addToQueue(song.song_id, true); 
                                playSong({song_id: song.song_id, progress: 0, playing: true}); 
                            }}
                        >
                            <img
                                src={song.cover_picture_url || defaultCoverPic}
                                alt={song.title}
                                className="song-cover"
                            />
                            {user?.user_type === "listener" && <div className="song-play-btn">▶</div>}
                        </div>
                        <div className="song-stat-info">
                            <span className="song-title-text" onClick={() => setSelectedSongId(song.song_id)}>
                                {song.title}
                            </span>
                            <span className="play-count">{song.play_count} {song.play_count === 1 ? 'listen' : 'listens'}</span>
                            <div
                                className="play-bar"
                                style={{ width: `${(song.play_count / maxPlays) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
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

export default ArtistStatsChart;
