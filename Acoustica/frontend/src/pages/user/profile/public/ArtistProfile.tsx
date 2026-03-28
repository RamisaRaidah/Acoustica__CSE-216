import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistInfo, GetArtistInfoResponse } from '@/services/user_service/artists';
import { GetArtistSongResponse, getArtistSongs } from '@/services/music_service/songs';
import { getArtistAlbums, GetArtistAlbumResponse } from '@/services/music_service/albums';
import { followArtist } from '@/services/social_service/connections';
import { useAuth } from '@/contexts/AuthContext';
import ArtistStatsChart from '@/components/user/artists/ArtistStatsChart.tsx';
import '@/pages/user/profile/public/ArtistProfile.css';
import defaultCoverPic from '@/assets/images/music/Default_Cover_Picture.png';
import playButtonPic from '@/assets/images/music/Play_Button.png';

function ArtistProfile() {
    const { artist_id } = useParams<{ artist_id: string }>();
    const { user } = useAuth();

    const [artist, setArtist] = useState<GetArtistInfoResponse | null>(null);
    const [songs, setSongs] = useState<GetArtistSongResponse[]>([]);
    const [albums, setAlbums] = useState<GetArtistAlbumResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const [songsExpanded, setSongsExpanded] = useState(false);
    const [albumsExpanded, setAlbumsExpanded] = useState(false);

    const SONGS_INITIAL = 4;
    const SONGS_MAX = 15;
    const ALBUMS_INITIAL = 4;
    const ALBUMS_MAX = 50;

    useEffect(() => {
        const loadArtist = async () => {
            if (!artist_id) return;
            try {
                const id = parseInt(artist_id);
                const [info, songData, albumData] = await Promise.all([
                    getArtistInfo(id),
                    getArtistSongs(id),
                    getArtistAlbums(id),
                ]);
                setArtist(info);
                setIsFollowing(info.is_following);
                setSongs(songData);
                setAlbums(albumData);
            } catch (err) {
                console.error('Failed to load artist:', err);
                setError('Failed to load artist profile');
            } finally {
                setLoading(false);
            }
        };
        loadArtist();
    }, [artist_id]);

    const handleFollow = async () => {
        if (!artist_id || !user) return;
        try {
            const response = await followArtist(parseInt(artist_id));
            setIsFollowing(response.is_following);
            if (artist) {
                setArtist({
                    ...artist,
                    follower_count: response.is_following
                        ? artist.follower_count + 1
                        : artist.follower_count - 1
                });
            }
        } catch (err) {
            console.error('Follow failed:', err);
        }
    };

    if (loading) return <div className="loading">Loading artist</div>;
    if (error) return <div className="error">{error}</div>;
    if (!artist) return <div className="error">Artist not found</div>;

    const visibleSongs = songs.slice(0, songsExpanded ? SONGS_MAX : SONGS_INITIAL);
    const visibleAlbums = albums.slice(0, albumsExpanded ? ALBUMS_MAX : ALBUMS_INITIAL);

    const showSeeMoreSongs = !songsExpanded && songs.length > SONGS_INITIAL;
    const showSeeLessSongs = songsExpanded;
    const showSeeMoreAlbums = !albumsExpanded && albums.length > ALBUMS_INITIAL;
    const showSeeLessAlbums = albumsExpanded;
    

    return (
        <div className="artist-profile-container">

            <div className="artist-top">

                <div className="artist-left">
                    <div className="artist-name-row">
                        <h1 className="artist-name">
                            {artist.stage_name || `${artist.first_name} ${artist.last_name}`}
                        </h1>
                        <button className="play-circle-btn" aria-label="Play">
                            <img src={playButtonPic} alt="Play" className="play-circle-img" />
                        </button>
                    </div>
                    <p className="artist-bio">
                        {artist.bio || `Hey, I am ${artist.stage_name || `${artist.first_name} ${artist.last_name}`}`}
                    </p>
                    {artist_id && <ArtistStatsChart artist_id={parseInt(artist_id)} />}
                </div>

                <div className="artist-right">
                    <img
                        src={artist.profile_picture_url || defaultCoverPic}
                        alt="Artist"
                        className="artist-profile-image"
                    />
                    <button
                        className={`follow-button ${isFollowing ? 'following' : ''}`}
                        onClick={handleFollow}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <div className="artist-meta">
                        <span>{artist.follower_count} followers</span>
                        <span>{artist.monthly_listeners} monthly listeners</span>
                    </div>
                </div>
            </div>


            <div className="artist-bottom-grid">

                <div className="artist-section">
                    <div className="section-header">
                        <h2>Songs</h2>
                        <div className="section-actions">
                            {showSeeMoreSongs && (
                                <button className="see-all-btn" onClick={() => setSongsExpanded(true)}>See more</button>
                            )}
                            {showSeeLessSongs && (
                                <button className="see-all-btn" onClick={() => setSongsExpanded(false)}>See less</button>
                            )}
                        </div>
                    </div>
                    <div className="media-grid">
                        {visibleSongs.map((song) => (
                            <div key={song.song_id} className="media-card">
                                <div className="media-thumb">
                                    <img src={song.cover_picture_url || defaultCoverPic} alt={song.title} />
                                </div>
                                <span className="media-label">{song.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="artist-section">
                    <div className="section-header">
                        <h2>Albums</h2>
                        <div className="section-actions">
                            {showSeeMoreAlbums && (
                                <button className="see-all-btn" onClick={() => setAlbumsExpanded(true)}>See more</button>
                            )}
                            {showSeeLessAlbums && (
                                <button className="see-all-btn" onClick={() => setAlbumsExpanded(false)}>See less</button>
                            )}
                        </div>
                    </div>
                    <div className="media-grid">
                        {visibleAlbums.map((album) => (
                            <div key={album.album_id} className="media-card">
                                <div className="media-thumb">
                                    <img src={album.cover_picture_url || defaultCoverPic} alt={album.title} />
                                </div>
                                <span className="media-label">{album.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ArtistProfile;
