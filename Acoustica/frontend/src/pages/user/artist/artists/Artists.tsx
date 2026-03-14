import "@/pages/user/artist/artists/Artists.css"
import { useEffect, useState } from "react";
import { getArtists, GetArtistsResponse } from "@/services/artist";

export function Artists() {
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);

    useEffect(() => {
        getArtists().then(setArtists);
    }, []);

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