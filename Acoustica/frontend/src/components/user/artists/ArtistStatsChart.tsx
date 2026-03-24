import { useEffect, useState } from 'react';
import { getArtistStats } from '@/services/analytics_service/analytics';
import '@/components/user/artists/ArtistStatsChart.css';
import defaultCoverPic from '@/assets/images/music/Default_Cover_Picture.png'

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
    const [stats, setStats] = useState<StatsData | null>(null);

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

    if (!stats || stats.top_songs.length === 0) return null;

    const maxPlays = stats.top_songs[0].play_count || 1;

    return (
        <div className="artist-stats-chart">
            {stats.top_songs.map((song) => (
                <div key={song.song_id} className="song-stat-item">
                    <img
                        src={song.cover_picture_url||defaultCoverPic}
                        alt={song.title}
                        className="song-cover"
                    />
                    <div className="song-stat-info">
                        <span className="play-count">{song.play_count} listens</span>
                        <div
                            className="play-bar"
                            style={{ width: `${(song.play_count / maxPlays) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ArtistStatsChart;
