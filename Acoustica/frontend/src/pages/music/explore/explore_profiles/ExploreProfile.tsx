import '@/pages/music/explore/explore_profiles/ExploreProfile.css';
import { useParams, useNavigate } from "react-router-dom";
import { SongInfo } from '@/services/music_service/songs';
import { useEffect, useState } from 'react';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import { useMusic } from '@/contexts/MusicContext';
import { getAlbumCoverPicture } from '@/services/music_service/albums';

export interface ExploreProfileConfig {
    paramKey: string;
    categoryLabel: string;
    getItems: () => Promise<{ id: number; name: string }[]>;
    getTrending: (id: number) => Promise<SongInfo[]>;
    getPopular: (id: number) => Promise<SongInfo[]>;
    getMySongs: (id: number) => Promise<SongInfo[]>;
    getColor: (index: number) => string;
}

const POPULAR_SONGS_COLUMNS = 5;

function formatPlayCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M plays`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K plays`;
    return `${n} plays`;
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function dedupeById(songs: SongInfo[]): SongInfo[] {
    return [...new Map(songs.map(s => [s.song_id, s])).values()];
}

function SongGrid({ songs, cover_pictures }: { songs: SongInfo[], cover_pictures: Record<number, string> }) {
    const [expanded, setExpanded] = useState(false);
    const { playSong } = useMusic();
    const navigate = useNavigate();
    const visible = expanded ? songs : songs.slice(0, POPULAR_SONGS_COLUMNS);
    const hasMore = songs.length > POPULAR_SONGS_COLUMNS;

    return (
        <div className="explore-song-section">
            <div className="explore-song-grid">
                {visible.map(song => (
                    <div className="explore-song-card" key={song.song_id}>
                        <div
                            className="explore-song-cover"
                            onClick={() => playSong({ song_id: song.song_id, playing: true, progress: 0 })}
                        >
                            <img src={cover_pictures[song.album_id] || default_cover} alt={song.title} />
                            <div className="explore-song-play-overlay">▶</div>
                        </div>
                        <p className="explore-song-title" onClick={() => navigate(`/music/songs/${song.song_id}`)}>
                            {song.title}
                        </p>
                        <p className="explore-song-artist" onClick={() => navigate(`/artists/${song.owner_id}`)}>
                            {song.owner_name}
                        </p>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="explore-see-all-row">
                    <button className="explore-see-all-btn" onClick={() => setExpanded(p => !p)}>
                        {expanded ? "Show less ▲" : "See all ▼"}
                    </button>
                </div>
            )}
        </div>
    );
}

function TrendingList({ songs, cover_pictures }: { songs: SongInfo[], cover_pictures: Record<number, string> }) {
    const { playSong } = useMusic();
    const navigate = useNavigate();

    return (
        <div className="explore-trending-list">
            {songs.map(song => (
                <div className="explore-trending-item" key={song.song_id}>
                    <div
                        className="explore-trending-cover"
                        onClick={() => playSong({ song_id: song.song_id, playing: true, progress: 0 })}
                    >
                        <img src={cover_pictures[song.album_id] || default_cover} alt={song.title} />
                        <div className="explore-trending-play">▶</div>
                    </div>
                    <div className="explore-trending-info">
                        <span className="explore-trending-title" onClick={() => navigate(`/music/songs/${song.song_id}`)}>
                            {song.title}
                        </span>
                        <span className="explore-trending-artist" onClick={() => navigate(`/artists/${song.owner_id}`)}>
                            {song.owner_name}
                        </span>
                    </div>
                    <span className="explore-trending-playcount">{formatPlayCount(song.play_count)}</span>
                </div>
            ))}
        </div>
    );
}

export default function ExploreProfile({ config }: { config: ExploreProfileConfig }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const params = useParams<Record<string, string>>();
    const paramValue = params[config.paramKey];

    const [itemName, setItemName] = useState("");
    const [itemColor, setItemColor] = useState("");
    const [trendingSongs, setTrendingSongs] = useState<SongInfo[]>([]);
    const [popularSongs, setPopularSongs] = useState<SongInfo[]>([]);
    const [recommendedSongs, setRecommendedSongs] = useState<SongInfo[]>([]);
    const [queueSongs, setQueueSongs] = useState<number[]>([]);
    const [cover_pictures, setCoverPictures] = useState<Record<number, string>>({});

    const { createQueue } = useMusic();

    useEffect(() => {
        async function loadData() {
            try {
                const items = await config.getItems();
                const found = items.find(x => x.name.toLowerCase() === paramValue?.toLowerCase());
                if (!found) throw new Error("Item not found");

                setItemName(found.name);
                setItemColor(config.getColor(items.findIndex(x => x.id === found.id)));

                const [trending, popular, my] = await Promise.all([
                    config.getTrending(found.id),
                    config.getPopular(found.id),
                    config.getMySongs(found.id),
                ]);

                setTrendingSongs(trending);
                setPopularSongs(popular);

                const combined = [...my.slice(0, 5), ...popular.slice(0, 3), ...trending.slice(0, 2)];
                const unique = shuffle(dedupeById(combined));
                setRecommendedSongs(unique);
                setQueueSongs(shuffle(dedupeById([...trending, ...popular, ...unique]).map(s => s.song_id)));
                const album_ids = [...new Map([...trending, ...popular, ...unique].map(s => [s.album_id, s])).keys()];

                const cp_entries = await Promise.all(
                    album_ids.map(async id => {
                        const res = await getAlbumCoverPicture(id);
                        return res.cover_picture_url !== 'null' ? [id, res.cover_picture_url] as const : null;
                    })
                );

                const cp_map: Record<number, string> = Object.fromEntries(
                    cp_entries.filter((e): e is [number, string] => e !== null)
                );

                setCoverPictures(cp_map);
            } catch (e) {
                console.error("ExploreProfile load error:", e);
                setError("Failed to load data!");
            }
            setLoading(false);
        }
        loadData();
    }, [paramValue]);

    if (loading) return <div id="explore-profile-container"><div className="loading">Loading</div></div>;
    if (error) return <div id="explore-profile-container"><div className="error">{error}</div></div>;

    const hasSongs = trendingSongs.length > 0 || popularSongs.length > 0 || recommendedSongs.length > 0;

    return (
        <div id="explore-profile-container">
            <div className="explore-top-row">

                <div className="explore-left-col">
                    <div className="explore-explore-box" style={{ background: itemColor }}>
                        <span className="explore-explore-label">{config.categoryLabel}</span>
                        <span className="explore-explore-name">{itemName}</span>
                        <span className="explore-explore-shine" />
                        <div className="explore-explore-play-btn" onClick={() => createQueue(queueSongs)}>▶</div>
                    </div>

                    {hasSongs && trendingSongs.length > 0 && (
                        <>
                            <div className="explore-section-header">Trending Songs</div>
                            <TrendingList songs={trendingSongs} cover_pictures={cover_pictures} />
                        </>
                    )}
                </div>

                <div className="explore-right-col">
                    {!hasSongs ? (
                        <div className="explore-no-songs">No songs</div>
                    ) : (
                        <>
                            {popularSongs.length > 0 && (
                                <>
                                    <div className="explore-section-header">Popular Songs</div>
                                    <SongGrid songs={popularSongs} cover_pictures={cover_pictures} />
                                </>
                            )}
                            {recommendedSongs.length > 0 && (
                                <>
                                    <div className="explore-section-header explore-section-header--spaced">Recommended for You</div>
                                    <SongGrid songs={recommendedSongs} cover_pictures={cover_pictures} />
                                </>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}