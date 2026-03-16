import "@/pages/user/artist/artists/Artists.css"
import { useEffect, useState } from "react";
import { getArtists, GetArtistsResponse } from "@/services/user_service/artists";

export default function Artists() {
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArtists() {
            try {
                const artists = await getArtists();
                if (artists) setArtists(artists);
            }
            catch(err) {
                console.log("ERROR: ", err);
                setError("Failed to load artists.");
            }
            finally {
                setLoading(false);
            }
        }

        loadArtists();
    }, []);

    if (loading) return <div className="loading">Loading artists...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="artist-container">
            <div id="artist-header">
                <h1>Artists</h1>
            </div>
            {artists && (
                <div id="artist-grid">
                    {
                        artists.map(artist => (
                            <div className="artist-card" key={artist.artist_id}>
                                <div className="artist-card-cover">
                                    <img src={artist.profile_picture_url} />
                                </div>
                                <div className="artist-card-info">
                                    <p className="artist-card-title">{artist.artist_name}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}