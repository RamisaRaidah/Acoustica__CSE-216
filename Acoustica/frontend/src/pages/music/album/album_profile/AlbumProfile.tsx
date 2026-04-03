import '@/pages/music/album/album_profile/AlbumProfile.css'
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import play_button from '@/assets/images/music/Play_Button.png';
import Alert from '@/components/alert/TwoButtonAlert';
import { useEffect, useState } from 'react';
import { Album, getAlbumDetails, getAlbumCoverPicture, getAlbumSongs, deleteAlbum, likeAlbum, isLiked } from '@/services/music_service/albums';
import { SongInfo } from '@/services/music_service/songs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ShareToFamilyPopup from '@/pages/social/family/ShareToFamily';
import { useMusic } from '@/contexts/MusicContext';

export default function AlbumProfile() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { album_id } = useParams<{ album_id: string }>();
    const albumId = Number(album_id);
    const [album, setAlbum] = useState<Album>();
    const [cover_picture, setCoverPicture] = useState<string | null>(null);
    const [songs, setSongs] = useState<SongInfo[]>([]);
    const [song_ids, setSongIds] = useState<number[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const { user } = useAuth();
    const { createQueue } = useMusic();
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [album, cover_picture, songs, liked] = await Promise.all([
                    getAlbumDetails(albumId),
                    getAlbumCoverPicture(albumId),
                    getAlbumSongs(albumId),
                    isLiked(albumId)
                ]);
                setAlbum(album);
                setCoverPicture(cover_picture.cover_picture_url);
                setSongs(songs);
                setSongIds(songs.map(x => x.song_id));
                setLiked(liked);
            }
            catch (e) {
                console.log("ERROR: ", e);
                setError("Failed to load data!");
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, [albumId]);

    useEffect(() => {
        let total = 0;
        songs.forEach(s => {
            total += s.length;
        })
        setDuration(total);
    }, [songs])

    async function handleDeleteAlbum() {
        try {
            const response = await deleteAlbum(albumId);
            if (response) {
                setAlertMessage('The album is deleted successfully!');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete the album';
            console.log('ERROR: ', message);
            setAlertMessage('Failed to delete the album');
        }
    }

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    if (loading) return <div className='loading'>Loading</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='album-profile-container'>
            {alertMessage && <Alert message={alertMessage} onConfirm={() => { setAlertMessage(null); navigate('/music/discography'); }} />}
            {confirmation && <Alert message='All the included songs will be deleted. Are you sure to delete the album?' type='confirm' onConfirm={() => { setConfirmation(false); handleDeleteAlbum(); }} onCancel={() => setConfirmation(false)} />}

            <div id="album-card">

                <div id="album-card-top">
                    <div id="card-cover-picture">
                        <img src={cover_picture || default_cover} alt="Album cover" />
                    </div>

                    <div id="card-info">
                        <p id="album-label">Album</p>
                        <h2 id="album-title">{album?.title || "Untitled"}</h2>
                        <div id='album-description'>{album?.description}</div>
                        <div id="album-meta">
                            {user?.user_type === 'listener' && <span>{album?.owner_name}</span>}
                            {user?.user_type === 'artist' && <span>{album?.visibility}</span>}
                            {songs.length > 0 &&
                                <>
                                    <span>•</span>
                                    <span>{songs.length} {songs.length > 1 ? "songs" : "song"}</span>
                                    <span>•</span>
                                    <span>
                                        {hrs > 0 && `${hrs} hr `}
                                        {mins > 0 && `${mins} min `}
                                        {secs > 0 && `${secs} sec`}
                                    </span>
                                </>
                            }
                        </div>
                        <div id="album-release-date-row">
                            <div id="album-release-date">
                                {   
                                    new Date(album?.release_date || "").toLocaleDateString('en-GB', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })
                                }
                            </div>
                            {
                                user?.user_type === 'listener' &&
                                <button id="like-album-btn" className={liked ? 'liked' : ''} onClick={() => { setLiked(prev => !prev); likeAlbum(albumId); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                        fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            }

                            
                        </div>
                    </div>

                    {
                        user?.user_type === 'listener' && 
                        <button id="play-album-btn" onClick={() => createQueue(song_ids)}>
                            <img src={play_button} alt="Play" />
                        </button>
                    }

                    {user?.user_type === 'listener' &&
                        <button id="share-album-btn" title='Share to Family' onClick={() => setShareOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    }

                    {
                        user?.user_type === 'artist' && Number(album?.owner_id) === Number(user.user_id) && 
                        <button id="edit-album-btn" onClick={() => navigate(`/music/albums/${albumId}/edit`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Album
                        </button>
                    }
                </div>

                <div id="album-card-bottom">
                    <div id="album-card-header">
                        <div>#</div>
                        <div>Title</div>
                        <div>Plays</div>
                        <div>Length</div>
                        <div></div>
                    </div>

                    <div id="song-cards">
                        {songs.map((song, index) => (
                            <div className="album-row" key={song.song_id}>
                                <div className="col-index">{index + 1}</div>

                                <div className="col-title">
                                    <p className="song-title">{song.title}</p>
                                    <p className="song-artist">{song.owner_name}</p>
                                </div>

                                <div className="col-album">{song.play_count}</div>

                                <div className="col-time">
                                    {Math.floor(song.length / 60)}:{(song.length % 60).toString().padStart(2, "0")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {user?.user_type === 'artist' && Number(album?.owner_id) === Number(user.user_id) && 
            <div id="delete-album-wrapper">
                <button id="delete-album-btn" onClick={() => setConfirmation(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Delete Album
                </button>
            </div>}

            {album?.asset_id && (
                <ShareToFamilyPopup
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    assetId={album.asset_id}
                />
            )}
        </div>
    );
}