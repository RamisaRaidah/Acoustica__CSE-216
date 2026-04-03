import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';
import { getFamilySharedContents, FamilySharedContent } from '@/services/social_service/social.ts';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import default_profile from '@/assets/images/Default_pfp.png';
import play_button from '@/assets/images/music/Play_Button.png';
import '@/pages/social/family/FamilySharedContents.css';

function formatDate(dt: string): string {
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

interface SharedCardProps {
    item: FamilySharedContent;
    onSongClick: (id: number) => void;
}

function SharedCard({ item, onSongClick }: SharedCardProps) {
    const { playSong } = useMusic();
    const navigate = useNavigate();

    function handleCardClick() {
        if (item.asset_type === 'song') onSongClick(item.typed_id);
        else if (item.asset_type === 'album') navigate(`/music/albums/${item.typed_id}`);
        else if (item.asset_type === 'playlist') navigate(`/music/playlists/${item.typed_id}`);
    }

    function handlePlay(e: React.MouseEvent) {
        e.stopPropagation();
        if (item.asset_type === 'song') {
            playSong({ song_id: item.typed_id, playing: true, progress: 0 });
        }
    }

    const cover = item.cover_picture ?? default_cover;
    const avatar = item.sender_profile_picture ?? default_profile;

    return (
        <div className="fsc-card" onClick={handleCardClick}>

            
            <div className="fsc-card-inner">


                <img className="fsc-card-cover" src={cover} alt={item.content_title} />

    
                <div className="fsc-card-type-badge">
                    {item.asset_type.charAt(0).toUpperCase() + item.asset_type.slice(1)}
                </div>

        
                <div className="fsc-card-title-overlay">
                    <span className="fsc-card-content-title">{item.content_title}</span>
                    {item.artist_name && (
                        <span className="fsc-card-content-artist">{item.artist_name}</span>
                    )}
                </div>

           
                <div className="fsc-card-panel">

    
                    {item.note && (
                        <div className="fsc-card-note">
                            <p>{item.note}</p>
                        </div>
                    )}
                    {
                        !item.note &&(
                            <div className="fsc-card-note">
                                <p></p>
                            </div>
                        )
                    }

            
                    <div className="fsc-card-footer">
                        <div className="fsc-card-footer-left">
                            <img className="fsc-card-avatar" src={avatar} alt={item.sender_name} />
                            <div className="fsc-card-meta">
                                <span className="fsc-card-sender">{item.sender_name}</span>
                                <span className="fsc-card-date">{formatDate(item.date_time)}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        
            {item.asset_type === 'song' && (
                <button className="fsc-card-play" onClick={handlePlay} aria-label="Play">
                    <img src={play_button} alt="play" />
                </button>
            )}

        </div>
    );
}

interface SectionProps {
    title: string;
    items: FamilySharedContent[];
    onSongClick: (id: number) => void;
}

function SharedSection({ title, items, onSongClick }: SectionProps) {
    if (items.length === 0) return null;
    return (
        <section className="fsc-section">
            <div className="fsc-section-header">{title}</div>
            <div className="fsc-grid">
                {items.map(item => (
                    <SharedCard key={item.family_shared_id} item={item} onSongClick={onSongClick} />
                ))}
            </div>
        </section>
    );
}

export default function FamilySharedContents() {
    const { familyId } = useParams<{ familyId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // For separate
    // const [songs, setSongs] = useState<FamilySharedContent[]>([]);
    // const [albums, setAlbums] = useState<FamilySharedContent[]>([]);
    // const [playlists, setPlaylists] = useState<FamilySharedContent[]>([]);

    const [items, setItems] = useState<FamilySharedContent[]>([]);

    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
    const [familyName, setFamilyName] = useState('');

    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            setError('No family ID provided.');
            return;
        }
        async function load() {
            try {
                const res = await getFamilySharedContents(Number(familyId));
                setFamilyName(res.family_name);
                const data = res.data ?? [];
                
                // setSongs(data.filter(d => d.asset_type === 'song'));
                // setAlbums(data.filter(d => d.asset_type === 'album'));
                // setPlaylists(data.filter(d => d.asset_type === 'playlist'));

                setItems([...data].sort(
                    (a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
                ));
            } catch {
                setError('Failed to load shared content.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [familyId]);

    if (loading) return <div className="fsc-loading">Loading</div>;
    if (error)   return <div className="fsc-error">{error}</div>;

    // const isEmpty = songs.length === 0 && albums.length === 0 && playlists.length === 0;

    const isEmpty = items.length === 0;

    return (
        <div id="fsc-container">
            <div className="fsc-header-row">
                <div className="fsc-title-block">
                    <h1 className="fsc-title">Where Music Meets Family</h1>
                    <div className="fsc-title-underline" />
                    {familyName && <p className="fsc-family-name">{familyName}</p>}
                </div>
            </div>

            {isEmpty ? (
                <div className="fsc-empty">No shared content yet. Be the first to share something!</div>
            ) : (
                
                <>
                    {/*
                        <SharedSection title="Songs"     items={songs}     onSongClick={setSelectedSongId} />
                        <SharedSection title="Albums"    items={albums}    onSongClick={setSelectedSongId} />
                        <SharedSection title="Playlists" items={playlists} onSongClick={setSelectedSongId} />
                    */}
                    <div className="fsc-grid">
                        {items.map(item => (
                            <SharedCard key={item.family_shared_id} item={item} onSongClick={setSelectedSongId} />
                        ))}
                    </div>

                </>
            )}

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