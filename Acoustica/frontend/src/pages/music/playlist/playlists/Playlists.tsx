import "@/pages/music/playlist/playlists/Playlists.css"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyPlaylists, getPopularPublicPlaylists, getPlaylistSongs, Playlist } from "@/services/music_service/playlists";
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import { useMusic } from "@/contexts/MusicContext";

const COLUMNS = 7;

interface PlaylistSectionProps {
    playlists: Playlist[];
    onNavigate: (id: number) => void;
}

function PlaylistSection({ playlists, onNavigate }: PlaylistSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const { createQueue } = useMusic();

    const visible = expanded ? playlists : playlists.slice(0, COLUMNS);
    const hasMore = playlists.length > COLUMNS;

    return (
        <div className="playlist-section">
            <div className="playlist-grid">
                {visible.map(playlist => (
                    <div className="playlist-card" key={playlist.playlist_id}>
                        <div className="playlist-card-cover">
                            <img src={playlist.cover_picture_url || default_cover} alt={playlist.title} onClick={() => {
                                getPlaylistSongs(playlist.playlist_id).then(songs => {
                                    const song_ids = songs.map(song => song.song_id);
                                    createQueue(song_ids);
                                })
                            }} />
                        </div>
                        <p className="playlist-card-title" onClick={() => onNavigate(playlist.playlist_id)}>{playlist.title}</p>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="see-all-row">
                    <button className="see-all-btn" onClick={() => setExpanded(prev => !prev)}>
                        {expanded ? "Show less ▲" : "See all ▼"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Playlists() {
    const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
    const [popularPublicPlaylists, setPopularPublicPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPlaylists() {
            try {
                const [my_playlists, popular_public_playlists] = await Promise.all([
                    getMyPlaylists(),
                    getPopularPublicPlaylists()
                ]);
                setMyPlaylists(my_playlists);
                setPopularPublicPlaylists(popular_public_playlists);
            } 
            catch (e) {
                console.log("ERROR: ", e);
                setError("Failed to load playlists!");
            }
            setLoading(false);
        }
        loadPlaylists();
    }, []);

    if (loading) return <div id="playlist-container"><div className="loading">Loading playlists</div></div>;
    if (error) return <div id="playlist-container"><div className="error">{error}</div></div>;

    return (
        <div id="playlist-container">
            <div className="playlist-header">
                <h1>Your Playlists</h1>
                <Link to="/music/create-playlist" id="create-playlist-button">+ Create playlist</Link>
            </div>
            {myPlaylists.length > 0
                ? <PlaylistSection playlists={myPlaylists} onNavigate={(id) => navigate(`/music/playlists/${id}`)} />
                : <p className="empty-state">You haven't created any playlists yet.</p>
            }

            <div className="playlist-header" style={{ marginTop: '4vh' }}>
                <h1>Popular Public Playlists</h1>
            </div>
            {popularPublicPlaylists.length > 0
                ? <PlaylistSection playlists={popularPublicPlaylists} onNavigate={(id) => navigate(`/music/playlists/${id}`)} />
                : <p className="empty-state">No public playlists available.</p>
            }
        </div>
    );
}