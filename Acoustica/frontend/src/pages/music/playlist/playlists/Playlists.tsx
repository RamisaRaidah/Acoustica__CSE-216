import "@/pages/music/playlist/playlists/Playlists.css"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPlaylists, GetMyPlaylistsResponse } from "@/services/playlist";

export function Playlists() {
    const [playlists, setPlaylists] = useState<GetMyPlaylistsResponse[]>([]);

    useEffect(() => {
        getMyPlaylists().then(setPlaylists);
    }, []);

    return (
        <div id="playlist_container">
            <div id="playlist_header">
                <h1>Playlists</h1>
                <Link to="/music/create-playlist" id="create_playlist_button">+ Create playlist</Link>
            </div>
            {playlists && (
                <div id="playlist_grid">
                    {
                        playlists.map(playlist => (
                            <div className="playlist_card" key={playlist.playlist_id}>
                                <div className="playlist_card_cover">
                                    <img src={playlist.cover_picture_url} />
                                </div>
                                <div className="playlist_card_info">
                                    <p className="playlist_card_title">{playlist.title}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}