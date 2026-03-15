import "@/pages/music/playlist/playlists/Playlists.css"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPlaylists, GetMyPlaylistsResponse } from "@/services/music_service/playlists";

export function Playlists() {
    const [playlists, setPlaylists] = useState<GetMyPlaylistsResponse[]>([]);

    useEffect(() => {
        getMyPlaylists().then(setPlaylists);
    }, []);

    return (
        <div id="playlist-container">
            <div id="playlist-header">
                <h1>Playlists</h1>
                <span><Link to="/music/create-playlist" id="create_playlist_button">+ Create playlist</Link></span>
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