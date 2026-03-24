import '@/pages/music/library/Library.css';
import { useAuth } from "@/contexts/AuthContext";
import { getAlbumCoverPicture, getAlbumSongs } from "@/services/music_service/albums";
import { getLikedSongs, getLikedAlbums, getLikedPlaylists, LikedSong, LikedAlbum, LikedPlaylist } from "@/services/user_service/listeners";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import play_button from '@/assets/images/music/Play_Button.png';
import { useMusic } from '@/contexts/MusicContext';
import { getPlaylistSongs } from '@/services/music_service/playlists';

const GRID_COLUMNS = 5;

function formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Liked Songs trending-style list ──────────────────────────────────────────

function LikedSongList({
    songs,
    cover_pictures,
}: {
    songs: LikedSong[];
    cover_pictures: Record<number, string>;
}) {
    const { playSong } = useMusic();
    const navigate = useNavigate();

    return (
        <div className="lib-trending-list">
            {songs.map(song => (
                <div className="lib-trending-item" key={song.song_id}>
                    <div
                        className="lib-trending-cover"
                        onClick={() => playSong({ song_id: song.song_id, playing: true, progress: 0 })}
                    >
                        <img src={cover_pictures[song.album_id] || default_cover} alt={song.title} />
                        <div className="lib-trending-play">▶</div>
                    </div>
                    <div className="lib-trending-info">
                        <span className="lib-trending-title" onClick={() => navigate(`/music/songs/${song.song_id}`)}>
                            {song.title}
                        </span>
                        <span className="lib-trending-artist" onClick={() => navigate(`/artists/${song.owner_id}`)}>
                            {song.owner_name}
                        </span>
                    </div>
                    <span className="lib-trending-meta">{formatDuration(song.length)}</span>
                </div>
            ))}
        </div>
    );
}

// ── Generic card grid (albums & playlists) ────────────────────────────────────

interface CardItem {
    id: number;
    title: string;
    subtitle?: string;
    cover_url?: string;
    onPlay: () => void;
    onNavigate: () => void;
    onSubtitleNavigate?: () => void; // NEW: optional click handler for subtitle
}

function CardGrid({ items }: { items: CardItem[] }) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? items : items.slice(0, GRID_COLUMNS);
    const hasMore = items.length > GRID_COLUMNS;

    return (
        <div className="lib-card-section">
            <div className="lib-card-grid">
                {visible.map(item => (
                    <div className="lib-card" key={item.id}>
                        <div className="lib-card-cover" onClick={item.onNavigate}>
                            <img src={item.cover_url || default_cover} alt={item.title} />
                            <div
                                className="lib-card-play-btn"
                                onClick={(e) => { e.stopPropagation(); item.onPlay(); }}
                            >
                                {/* FIX: pointer-events none on inner img so clicks reach the button div */}
                                <img src={play_button} style={{ pointerEvents: 'none' }} />
                            </div>
                        </div>
                        <p className="lib-card-title" onClick={item.onNavigate}>{item.title}</p>
                        {item.subtitle && (
                            // FIX: add --link class and onClick when onSubtitleNavigate is provided
                            <p
                                className={`lib-card-subtitle${item.onSubtitleNavigate ? ' lib-card-subtitle--link' : ''}`}
                                onClick={item.onSubtitleNavigate}
                            >
                                {item.subtitle}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="lib-see-all-row">
                    <button className="lib-see-all-btn" onClick={() => setExpanded(p => !p)}>
                        {expanded ? 'Show less ▲' : 'See all ▼'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Library() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
    const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
    const [likedPlaylists, setLikedPlaylists] = useState<LikedPlaylist[]>([]);
    const [cover_pictures, setCoverPictures] = useState<Record<number, string>>({});

    const { playSong, createQueue } = useMusic();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadData() {
            try {
                const [songs, albums, playlists] = await Promise.all([
                    getLikedSongs(),
                    getLikedAlbums(),
                    getLikedPlaylists(),
                ]);

                const album_ids = [...new Set([
                    ...songs.map(x => x.album_id),
                    ...albums.map(x => x.album_id),
                ])];

                const cp_entries = await Promise.all(
                    album_ids.map(async id => {
                        const res = await getAlbumCoverPicture(id);
                        return res.cover_picture_url !== 'null'
                            ? [id, res.cover_picture_url] as const
                            : null;
                    })
                );

                const cp_map: Record<number, string> = Object.fromEntries(
                    cp_entries.filter((e): e is [number, string] => e !== null)
                );

                setLikedSongs(songs);
                setLikedAlbums(albums);
                setLikedPlaylists(playlists);
                setCoverPictures(cp_map);
            }
            catch (e) {
                console.log("ERROR: ", e);
                setError("Failed to load data!");
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const songQueueIds = likedSongs.map(s => s.song_id);

    const albumItems: CardItem[] = likedAlbums.map(album => ({
        id: album.album_id,
        title: album.title,
        subtitle: album.owner_name,
        cover_url: cover_pictures[album.album_id],
        onPlay: () => {
            getAlbumSongs(album.album_id).then(songs => {
                createQueue(songs.map(s => s.song_id));
            });
        },
        onNavigate: () => navigate(`/music/albums/${album.album_id}`),
        // FIX: wire up artist name navigation for liked albums
        onSubtitleNavigate: () => navigate(`/artists/${album.owner_id}`),
    }));

    const playlistItems: CardItem[] = likedPlaylists.map(pl => ({
        id: pl.playlist_id,
        title: pl.title,
        cover_url: pl.cover_picture_url || undefined,
        onPlay: () => {
            getPlaylistSongs(pl.playlist_id).then(songs => {
                createQueue(songs.map(s => s.song_id));
            });
        },
        onNavigate: () => navigate(`/music/playlists/${pl.playlist_id}`),
        // playlists have no artist subtitle so onSubtitleNavigate is omitted
    }));

    if (loading) return <div className="loading">Loading</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="library-container">
            <div className="lib-top-row">

                <div className="lib-left-col">
                    <div
                        className="lib-box"
                        style={{ background: "linear-gradient(140deg, #ff6b6b 0%, #c0392b 60%, #7b1010 100%)", }}
                    >
                        <span className="lib-label">Your Library</span>
                        <span className="lib-name">Liked Songs</span>
                        <span className="lib-count">{likedSongs.length} songs</span>
                        <span className="lib-shine" />
                        <div
                            className="lib-play-btn"
                            onClick={() => createQueue(songQueueIds)}
                        >
                            ▶
                        </div>
                    </div>

                    {likedSongs.length > 0 ? (
                        <LikedSongList songs={likedSongs} cover_pictures={cover_pictures} />
                    ) : (
                        <p className="lib-empty">No liked songs yet.</p>
                    )}
                </div>

                <div className="lib-right-col">

                    <div className="lib-section-header">Liked Albums</div>
                    {likedAlbums.length > 0 ? <CardGrid items={albumItems} /> : <p className="lib-empty">No liked album yet.</p>}

                    <div className="lib-section-header lib-section-header--spaced">Liked Playlists</div>
                    {likedPlaylists.length > 0 ? <CardGrid items={playlistItems} /> : <p className="lib-empty">No liked playlist yet.</p>}
                </div>

            </div>
        </div>
    );
}