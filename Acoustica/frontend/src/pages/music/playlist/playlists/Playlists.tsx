import "@/pages/music/playlist/playlists/Playlists.css"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPlaylists, GetMyPlaylistsResponse } from "@/services/music_service/playlists";

export function Playlists() {
    const [playlists, setPlaylists] = useState<GetMyPlaylistsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPlaylists() {
            try {
                const playlists = await getMyPlaylists();
                if (playlists) setPlaylists(playlists);
            }
            catch(e) {
                console.log("ERROR: ", e);
                setError("Failed to load playlists.");
            }
            setLoading(false);
        }
        loadPlaylists();
    }, []);

    if (loading) return <div className="loading">Loading playlists...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="playlist-container">
            <div id="playlist-header">
                <h1>Playlists</h1>
                <span><Link to="/music/create-playlist" id="create-playlist-button">+ Create playlist</Link></span>
            </div>
            {playlists && (
                <div id="playlist-grid">
                    {
                        playlists.map(playlist => (
                            <div className="playlist-card" key={playlist.playlist_id}>
                                <div className="playlist-card-cover">
                                    <img src={playlist.cover_picture_url} />
                                </div>
                                <div className="playlist-card-info">
                                    <p className="playlist-card-title">{playlist.title}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}