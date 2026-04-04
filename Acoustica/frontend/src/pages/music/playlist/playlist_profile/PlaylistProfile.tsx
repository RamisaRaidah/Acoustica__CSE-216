import '@/pages/music/playlist/playlist_profile/PlaylistProfile.css';
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import play_button from '@/assets/images/music/Play_Button.png';
import Alert from '@/components/alert/TwoButtonAlert';
import { useEffect, useState } from 'react';
import { SongInfo } from '@/services/music_service/songs';
import { Playlist, getPlaylistDetails, getPlaylistSongs, deletePlaylist, likePlaylist, isLiked, addViewCount } from '@/services/music_service/playlists';
import { useNavigate, useParams } from 'react-router-dom';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';
import ShareToFamilyPopup from '@/pages/social/family/ShareToFamily';

export default function PlaylistProfile() {
    const navigate = useNavigate();
    const { playlist_id } = useParams<{playlist_id: string}>();
    const playlistId = Number(playlist_id);
    const [playlist, setPlaylist] = useState<Playlist>();
    const [songs, setSongs] = useState<SongInfo[]>([]);
    const [song_ids, setSongIds] = useState<number[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [deleteOn, setDeleteOn] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const { createQueue } = useMusic();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                await addViewCount(playlistId);
                const [playlist, songs, liked] = await Promise.all([
                    getPlaylistDetails(playlistId),
                    getPlaylistSongs(playlistId),
                    isLiked(playlistId)
                ]);
                setPlaylist(playlist);
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
    }, []);

    useEffect(() => {
        let total = 0;
        songs.forEach(s => {
            total += s.length;
        })
        setDuration(total);
    }, [songs])

    async function handleDeletePlaylist() {
        try {
            const response = await deletePlaylist(playlistId);
            if (response) {
                setAlertMessage('The playlist is deleted successfully!');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete the playlist!';
            console.log('ERROR: ', message);
            setAlertMessage('Failed to delete the playlist!');
        }
    }

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    if (loading) return <div className='loading'>Loading</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='playlist-profile-container'>
            {alertMessage && <Alert message={alertMessage} onConfirm={() => { setAlertMessage(null); navigate('/music/playlists'); }} />}
            {deleteOn && <Alert message='Are you sure to delete the playlist?' type='confirm' onConfirm={() => { setDeleteOn(false); handleDeletePlaylist(); }} onCancel={() => setDeleteOn(false)}/>}

            <div id="playlist-card">

                <div id="playlist-card-top">
                    <div id="card-cover-picture">
                        <img src={playlist?.cover_picture_url || default_cover} alt="Playlist cover" />
                    </div>

                    <div id="card-info">
                        <p id="playlist-label">Playlist</p>
                        <h2 id="playlist-title">{playlist?.title || "Untitled"}</h2>
                        <div id='playlist-description'>{playlist?.description}</div>
                        <div id='playlist-creator'>{playlist?.creator_name}</div>
                        <div id="playlist-meta">
                            <span>{playlist?.visibility}</span>
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
                        <div id="playlist-view-count-row">
                            <div id="playlist-view-count">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                {playlist?.view_count} {playlist?.view_count === 1 ? "view" : "views"}
                            </div>
                            {
                                Number(user?.user_id) !== Number(playlist?.creator_id) &&
                                <button id="like-playlist-btn" className={liked ? 'liked' : ''} onClick={() => { setLiked(prev => !prev); likePlaylist(playlistId); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                        fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            }
                        </div>
                    </div>

                    <button id="play-playlist-btn" onClick={() => createQueue(song_ids)}>
                        <img src={play_button} alt="Play" />
                    </button>

                    {Number(user?.user_id) !== Number(playlist?.creator_id) && (
                        <button id="share-playlist-btn" onClick={() => setShareOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    )}

                    {
                        Number(user?.user_id) === Number(playlist?.creator_id) && 
                        <button id="edit-playlist-btn" onClick={() => navigate(`/music/playlists/${playlistId}/edit`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Playlist
                        </button>
                    }
                </div>

                <div id="playlist-card-bottom">
                    <div id="playlist-card-header">
                        <div>#</div>
                        <div>Title</div>
                        <div>Album</div>
                        <div>Length</div>
                        <div></div>
                    </div>

                    <div id="song-cards">
                        {songs.map((song, index) => (
                            <div className="playlist-row" key={song.song_id}>
                                <div className="col-index">{index + 1}</div>

                                <div className="col-title">
                                    <p className="song-title">{song.title}</p>
                                    <p className="song-artist">{song.owner_name}</p>
                                </div>

                                <div className="col-album">{song.album_title}</div>

                                <div className="col-time">
                                    {Math.floor(song.length / 60)}:{(song.length % 60).toString().padStart(2, "0")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {
                Number(user?.user_id) === Number(playlist?.creator_id) && 
                <div id="delete-playlist-wrapper">
                    <button id="delete-playlist-btn" onClick={() => setDeleteOn(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete Playlist
                    </button>
                </div>
            }
            {playlist?.asset_id && (
                <ShareToFamilyPopup
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    assetId={playlist.asset_id}
                />
            )}
        </div>
    );
}