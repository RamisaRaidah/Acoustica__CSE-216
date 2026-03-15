import "@/pages/user/artist/artists/Artists.css"
import { useEffect, useState } from "react";
import { getArtists, GetArtistsResponse } from "@/services/user_service/artists";

export function Artists() {
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadArtists() {
            try {
                const artists = await getArtists();
                if (artists) setArtists(artists.concat(artists).concat(artists));
            }
            catch(e) {
                console.log("ERROR: ", e);
                setError("Failed to load artists.");
            }
            setLoading(false);
        }
        loadArtists();
    }, []);

    if (loading) return <div className="loading">Loading artists...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="artist_container">
            <div id="artist_header">
                <h1>Artists</h1>
            </div>
            {artists && (
                <div id="artist_grid">
                    {
                        artists.map(artist => (
                            <div className="artist_card" key={artist.artist_id}>
                                <div className="artist_card_cover">
                                    <img src={artist.profile_picture_url} />
                                </div>
                                <div className="artist_card_info">
                                    <p className="artist_card_title">{artist.artist_name}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}