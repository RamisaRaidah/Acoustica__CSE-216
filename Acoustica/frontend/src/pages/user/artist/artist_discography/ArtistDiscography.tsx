import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getArtistTrendingSongs, getArtistPopularSongs } from '@/services/analytics_service/analytics';
import { getArtistSongs, getArtistCollaborationSongs, GetArtistSongResponse, SongInfo } from '@/services/music_service/songs';
import { getArtistAlbums, GetArtistAlbumResponse } from '@/services/music_service/albums';
import '@/pages/user/artist/artist_discography/ArtistDiscography.css';
import defaultCoverPic from '@/assets/images/music/Default_Cover_Picture.png';
import SongProfile from "@/pages/music/song/song_profile/SongProfile";

interface MediaItem {
    id: number;
    title: string;
    coverUrl: string | null;
    sublabel?: string;
    isTrending?: boolean;
}

interface MediaSectionProps {
    title: string;
    items: MediaItem[];
    onCardClick: (id: number) => void;
    accentHeader?: boolean;
    isTrendingGrid?: boolean;
    initialCount?: number;
    maxCount?: number;
    emptyMessage?: string;
    fiveCol?: boolean;
}

function MediaSection({
    title,
    items,
    onCardClick,
    accentHeader = false,
    isTrendingGrid = false,
    initialCount = 4,
    maxCount = 50,
    emptyMessage = 'Nothing here yet.',
    fiveCol = false,
}: MediaSectionProps) {
    const [expanded, setExpanded] = useState(false);

    const visible = items.slice(0, expanded ? maxCount : initialCount);
    const showMore = !expanded && items.length > initialCount;
    const showLess = expanded;

    return (
        <div className="disco-section">
            <div className="disco-section-header">
                <h2 className={accentHeader ? 'accent-header' : ''}>{title}</h2>
                <div className="section-actions">
                    {showMore && (
                        <button className="see-all-btn" onClick={() => setExpanded(true)}>
                            See more ▼
                        </button>
                    )}
                    {showLess && (
                        <button className="see-all-btn" onClick={() => setExpanded(false)}>
                            See less ▲
                        </button>
                    )}
                </div>
            </div>

            {items.length === 0 ? (
                <p className="disco-empty">{emptyMessage}</p>
            ) : (
                <div className={`media-grid${isTrendingGrid ? ' trending-grid' : ''}${fiveCol ? ' five-col' : ''}`}>
                    {visible.map((item) => (
                        <div
                            key={item.id}
                            className="media-card"
                            onClick={() => onCardClick(item.id)}
                        >
                            <div className="media-thumb">
                                <img
                                    src={item.coverUrl || defaultCoverPic}
                                    alt={item.title}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = defaultCoverPic;
                                    }}
                                />
                            </div>
                            <span className="media-label" title={item.title}>
                                {item.title}
                            </span>
                            {item.sublabel && (
                                <span className="media-sublabel" title={item.sublabel}>
                                    {item.sublabel}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Discography() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location=useLocation();

    const [topSongs, setTopSongs] = useState<SongInfo[]>([]);
    const [allSongs, setAllSongs] = useState<GetArtistSongResponse[]>([]);
    const [trendingSongs, setTrendingSongs] = useState<SongInfo[]>([]);
    const [albums, setAlbums] = useState<GetArtistAlbumResponse[]>([]);
    const [collabs, setCollabs] = useState<GetArtistSongResponse[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

    useEffect(() => {
        if (!user?.user_id) return;

        const artistId = user.user_id;

        const load = async () => {
            try {
                const [popular, trending, artistSongs, artistAlbums, collabSongs] =
                    await Promise.all([
                        getArtistPopularSongs(artistId),
                        getArtistTrendingSongs(artistId),
                        getArtistSongs(artistId),
                        getArtistAlbums(artistId),
                        getArtistCollaborationSongs(artistId),
                    ]);

                setTopSongs(popular.slice(0, 8));
                setTrendingSongs(trending);
                setAllSongs(artistSongs);
                setAlbums(artistAlbums);
                setCollabs(collabSongs);
            } catch (err) {
                console.error('Failed to load discography:', err);
                setError('Failed to load your discography.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    if (loading) return <div className="loading">Loading your discography</div>;
    if (error) return <div className="error">{error}</div>;


    const toMediaFromArtistSong = (s: GetArtistSongResponse): MediaItem => ({
        id: s.song_id,
        title: s.title,
        coverUrl: s.cover_picture_url,
    });

    const toMediaFromSongInfo = (s: SongInfo): MediaItem => ({
        id: s.song_id,
        title: s.title,
        coverUrl: null,
        sublabel: s.owner_name,
        isTrending: true,
    });

    const toMediaFromAlbum = (a: GetArtistAlbumResponse): MediaItem => ({
        id: a.album_id,
        title: a.title,
        coverUrl: a.cover_picture_url,
    });

    const hasTrending = trendingSongs.length > 0;

    return (
        <div className="discography-container">
            
            <div className="discography-layout">

                <div className="discography-left">

                    <div className="discography-hero">
                        <h1 className="discography-hero-title">
                            Discover the <br />
                            <span>World of Your</span><br />
                            <span>Creations</span>
                        </h1>
                        <div className="discography-hero-underline" />
                    </div>

                    <MediaSection
                        title="Top Songs"
                        fiveCol
                        items={topSongs.map(toMediaFromSongInfo)}
                        onCardClick={(id) => setSelectedSongId(id)}
                        initialCount={5}
                        maxCount={10}
                        emptyMessage="No popular songs yet."
                    />

                    <MediaSection
                        title="All Songs"
                        fiveCol
                        items={allSongs.map(toMediaFromArtistSong)}
                        onCardClick={(id) => setSelectedSongId(id)}
                        initialCount={5}
                        maxCount={50}
                        emptyMessage="You haven't uploaded any songs yet."
                    />
                </div>

                <div className="discography-right">
                    {hasTrending && (
                        <MediaSection
                            title="Trending Songs"
                            items={trendingSongs.map(toMediaFromSongInfo)}
                            onCardClick={(id) => setSelectedSongId(id)}
                            accentHeader
                            isTrendingGrid
                            initialCount={4}
                            maxCount={12}
                        />
                    )}

                    <MediaSection
                        title="Your Albums"
                        items={albums.map(toMediaFromAlbum)}
                        onCardClick={(id) => navigate(`/music/albums/${id}`)}
                        initialCount={8}
                        maxCount={50}
                        emptyMessage="No albums yet. Create your first one!"
                    />

                    <MediaSection
                        title="Your Collaborations"
                        items={collabs.map(toMediaFromArtistSong)}
                        onCardClick={(id) => setSelectedSongId(id)}
                        initialCount={4}
                        maxCount={50}
                        emptyMessage="No collaborations found."
                    />
                </div>

            </div>
            {selectedSongId && (
                <SongProfile
                    isOpen={true}
                    onClose={() => setSelectedSongId(null)}
                    songId={selectedSongId}
                />
            )}
        </div>
    );
}

export default Discography;