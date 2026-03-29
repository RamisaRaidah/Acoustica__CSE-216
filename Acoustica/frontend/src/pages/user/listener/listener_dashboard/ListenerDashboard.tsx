import '@/pages/user/listener/listener_dashboard/ListenerDashboard.css';
import banner_img from '@/assets/images/deco/Banner2.png';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import default_profile_picture from '@/assets/images/Default_pfp.png';
import play_button from '@/assets/images/music/Play_Button.png';
import { getTrendingSongs, getPopularSongs, getTrendingArtists, getPopularArtists } from '@/services/analytics_service/analytics';
import { SongInfo } from '@/services/music_service/songs';
import { Artist } from '@/services/user_service/artists';
import { getAlbumCoverPicture } from '@/services/music_service/albums';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '@/contexts/MusicContext';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPlayCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M plays`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K plays`;
    return `${n} plays`;
}

// ─── Recently Played (trending-list style) ───────────────────────────────────

function RecentlyPlayedList({
    songs,
    coverPictures,
}: {
    songs: SongInfo[];
    coverPictures: Record<number, string>;
}) {
    const { playSong } = useMusic();
    const navigate = useNavigate();

    return (
        <div className="ld-recently-list">
            {songs.map(song => (
                <div className="ld-recently-item" key={song.song_id}>
                    <div
                        className="ld-recently-cover"
                        onClick={() => playSong({ song_id: song.song_id, playing: true, progress: 0 })}
                    >
                        <img src={coverPictures[song.album_id] || default_cover} alt={song.title} />
                        <div className="ld-recently-play">▶</div>
                    </div>
                    <div className="ld-recently-info">
                        <span
                            className="ld-recently-title"
                            onClick={() => navigate(`/music/songs/${song.song_id}`)}
                        >
                            {song.title}
                        </span>
                        <span
                            className="ld-recently-artist"
                            onClick={() => navigate(`/artists/${song.owner_id}`)}
                        >
                            {song.owner_name}
                        </span>
                    </div>
                    <span className="ld-recently-count">{formatPlayCount(song.play_count)}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Song Grid (playlist-card style) ────────────────────────────────────────

function SongGrid({
    songs,
    coverPictures,
    columns,
}: {
    songs: SongInfo[];
    coverPictures: Record<number, string>;
    columns: number;
}) {
    const { playSong } = useMusic();
    const navigate = useNavigate();

    return (
        <div className="ld-song-grid">
            {songs.map(song => (
                <div className="ld-song-card" key={song.song_id}>
                    <div
                        className="ld-song-cover"
                        onClick={() => navigate(`/music/songs/${song.song_id}`)}
                    >
                        <img src={coverPictures[song.album_id] || default_cover} alt={song.title} />
                        <div
                            className="ld-song-play-btn"
                            onClick={e => {
                                e.stopPropagation();
                                playSong({ song_id: song.song_id, playing: true, progress: 0 });
                            }}
                        >
                            <img src={play_button} alt="play" />
                        </div>
                    </div>
                    <p
                        className="ld-song-title"
                        onClick={() => navigate(`/music/songs/${song.song_id}`)}
                    >
                        {song.title}
                    </p>
                    <p
                        className="ld-song-artist"
                        onClick={() => navigate(`/artists/${song.owner_id}`)}
                    >
                        {song.owner_name}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─── Artist Grid ─────────────────────────────────────────────────────────────

function ArtistGrid({
    artists,
    columns,
}: {
    artists: Artist[];
    columns: number;
}) {
    const navigate = useNavigate();

    return (
        <div
            className="ld-artist-grid"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
            {artists.map(artist => (
                <div
                    className="ld-artist-card"
                    key={artist.artist_id}
                    onClick={() => navigate(`/artists/${artist.artist_id}`)}
                >
                    <div className="ld-artist-cover">
                        <img
                            src={
                                artist.profile_picture === 'null'
                                    ? default_profile_picture
                                    : artist.profile_picture
                            }
                            alt={artist.artist_name}
                        />
                    </div>
                    <p className="ld-artist-name">{artist.artist_name}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
    return <div className="ld-section-header">{title}</div>;
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function ListenerDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trendingSongs, setTrendingSongs] = useState<SongInfo[]>([]);
    const [popularSongs, setPopularSongs] = useState<SongInfo[]>([]);
    const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
    const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
    const [coverPictures, setCoverPictures] = useState<Record<number, string>>({});

    useEffect(() => {
        async function loadData() {
            try {
                const [ts, ps, ta, pa] = await Promise.all([
                    getTrendingSongs(),
                    getPopularSongs(),
                    getTrendingArtists(),
                    getPopularArtists(),
                ]);

                setTrendingSongs(ts);
                setPopularSongs(ps);
                setTrendingArtists(ta);
                setPopularArtists(pa);

                // load cover pictures for all songs
                const allSongs = [...ts, ...ps];
                const albumIds = [...new Set(allSongs.map(s => s.album_id))];
                const entries = await Promise.all(
                    albumIds.map(async id => {
                        const res = await getAlbumCoverPicture(id);
                        return res.cover_picture_url !== 'null'
                            ? ([id, res.cover_picture_url] as const)
                            : null;
                    })
                );
                setCoverPictures(
                    Object.fromEntries(entries.filter((e): e is [number, string] => e !== null))
                );
            } catch (err) {
                console.error('ListenerDashboard load error:', err);
                setError('Failed to load data!');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div className="loading">Loading</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="ld-container">

            {/* ── Two-column layout: left = banner + songs, right = lists + artists ── */}
            <div className="ld-top-row">

                {/* LEFT: banner on top, then song sections below */}
                <div className="ld-left-col">
                    <div className="ld-banner-wrapper">
                        <img src={banner_img} className="ld-banner" alt="banner" />
                    </div>

                    {trendingSongs.length > 0 && (
                        <section className="ld-section">
                            <SectionHeader title="Trending songs" />
                            <SongGrid songs={trendingSongs} coverPictures={coverPictures} columns={5} />
                        </section>
                    )}

                    {popularSongs.length > 0 && (
                        <section className="ld-section">
                            <SectionHeader title="Popular songs" />
                            <SongGrid songs={popularSongs} coverPictures={coverPictures} columns={5} />
                        </section>
                    )}
                </div>

                {/* RIGHT: recently played + artists */}
                <div className="ld-right-col">
                    {popularSongs.length > 0 && (
                        <section className="ld-section">
                            <SectionHeader title="Recently played" />
                            <RecentlyPlayedList
                                songs={popularSongs.slice(0, 6)}
                                coverPictures={coverPictures}
                            />
                        </section>
                    )}

                    {trendingArtists.length > 0 && (
                        <section className="ld-section">
                            <SectionHeader title="Trending artists" />
                            <ArtistGrid artists={trendingArtists} columns={3} />
                        </section>
                    )}

                    {popularArtists.length > 0 && (
                        <section className="ld-section">
                            <SectionHeader title="Popular artists" />
                            <ArtistGrid artists={popularArtists} columns={3} />
                        </section>
                    )}
                </div>
            </div>

        </div>
    );
}