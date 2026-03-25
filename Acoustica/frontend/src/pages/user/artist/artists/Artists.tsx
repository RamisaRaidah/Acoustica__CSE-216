import "@/pages/user/artist/artists/Artists.css"
import { useEffect, useState } from "react";
import { getArtists, Artist, getArtistSongMetadata } from "@/services/user_service/artists";
import { getFollowedArtists } from "@/services/social_service/connections";
import { useNavigate } from "react-router-dom";
import default_profile_picture from '@/assets/images/Default_pfp.png';
import play_button from '@/assets/images/music/Play_Button.png';
import { useMusic } from "@/contexts/MusicContext";

const COLUMNS = 7;

interface ArtistSectionProps {
    artists: Artist[];
    onNavigate: (id: number) => void;
}

function ArtistSection({ artists, onNavigate }: ArtistSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? artists : artists.slice(0, COLUMNS);
    const hasMore = artists.length > COLUMNS;
    const { createQueue } = useMusic();

    return (
        <div className="artist-section">
            <div className="artist-grid">
                {visible.map(artist => (
                    <div className="artist-card" key={artist.artist_id}>
                        <div
                            className="artist-card-cover"
                            onClick={() => onNavigate(artist.artist_id)}
                        >
                            <img src={artist.profile_picture === "null" ? default_profile_picture : artist.profile_picture} />
                            <div
                                className="artist-card-play-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    getArtistSongMetadata(artist.artist_id).then(createQueue);
                                }}
                            >
                                <img src={play_button} />
                            </div>
                        </div>
                        <p
                            className="artist-card-title"
                            onClick={() => onNavigate(artist.artist_id)}
                        >
                            {artist.artist_name}
                        </p>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="artist-see-all-row">
                    <button className="artist-see-all-btn" onClick={() => setExpanded(p => !p)}>
                        {expanded ? "Show less ▲" : "See all ▼"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Artists() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadArtists() {
            try {
                const [all, followed] = await Promise.all([
                    getArtists(),
                    getFollowedArtists(),
                ]);
                setArtists(all);
                setFollowedArtists(followed);
            } catch (err) {
                console.log("ERROR: ", err);
                setError("Failed to load data!");
            } finally {
                setLoading(false);
            }
        }
        loadArtists();
    }, []);

    if (loading) return <div className="loading">Loading</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div id="artist-container">
            <div className="artist-header">
                <h1>Artists</h1>
            </div>
            {artists.length > 0
                ? <ArtistSection artists={artists} onNavigate={(id) => navigate(`/artists/${id}`)} />
                : <p className="artist-empty">No artists found.</p>
            }

            <div className="artist-header" style={{ marginTop: '4vh' }}>
                <h1>Your Followed Artists</h1>
            </div>
            {followedArtists.length > 0
                ? <ArtistSection artists={followedArtists} onNavigate={(id) => navigate(`/artists/${id}`)} />
                : <p className="artist-empty">You haven't followed any artists yet.</p>
            }
        </div>
    );
}