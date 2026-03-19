import '@/pages/music/playlist/playlist_profile/PlaylistProfile.css'
import default_cover from '@/assets/images/deco/Default_Cover_Picture.png';
import play_button from '@/assets/images/music/Play_Button.png';
import Alert from '@/components/alert/TwoButtonAlert';
import { useEffect, useState } from 'react';
import { getPlaylistDatails, getPlaylistSongs, GetPlaylistSongsResponse, deletePlaylist } from '@/services/music_service/playlists';
import { useNavigate, useParams } from 'react-router-dom';

export default function PlaylistProfile() {
    const navigate = useNavigate();
    const { playlist_id } = useParams<{playlist_id: string}>();
    const playlistId = Number(playlist_id);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [cover_picture, setCoverPicture] = useState<string | null>(null);
    const [privacy, setPrivacy] = useState<string>('');
    const [songs, setSongs] = useState<GetPlaylistSongsResponse[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [view_count, setViewCount] = useState<number>(0);
    const [deleteOn, setDeleteOn] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        getPlaylistDatails(playlistId).then(info => {
            setTitle(info.title);
            setDescription(info.description);
            setCoverPicture(info.cover_picture_url);
            setPrivacy(info.visibility);
            setViewCount(info.view_count);
        })
        getPlaylistSongs(playlistId).then(setSongs);
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
            const message = err instanceof Error ? err.message : 'Failed to delete the playlist';
            console.log('ERROR: ', message);
            setAlertMessage(message);
        }
    }

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    return (
        <div id='playlist-profile-container'>
            {alertMessage && <Alert message={alertMessage} onConfirm={() => { setAlertMessage(null); navigate('/music/playlists'); }} />}
            {deleteOn && <Alert message='Are you sure to delete the playlist?' type='confirm' onConfirm={() => { setDeleteOn(false); handleDeletePlaylist(); }} onCancel={() => setDeleteOn(false)}/>}

            <div id="playlist-card">

                <div id="playlist-card-top">
                    <div id="card-cover-picture">
                        <img src={cover_picture || default_cover} alt="Playlist cover" />
                    </div>

                    <div id="card-info">
                        <p id="playlist-label">Playlist</p>
                        <h2 id="playlist-title">{title || "Untitled"}</h2>
                        <div id='playlist-description'>{description}</div>
                        <div id="playlist-meta">
                            <span>{privacy}</span>
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
                        <div id="playlist-view-count">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            {view_count} {view_count === 1 ? "view" : "views"}
                        </div>
                    </div>

                    <button id="play-playlist-btn">
                        <img src={play_button} alt="Play" />
                    </button>

                    <button id="edit-playlist-btn" onClick={() => navigate(`/music/playlists/${playlistId}/edit`)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Playlist
                    </button>
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
                                    <p className="song-artist">{song.artist_name}</p>
                                </div>

                                <div className="col-album">{song.album_name}</div>

                                <div className="col-time">
                                    {Math.floor(song.length / 60)}:{(song.length % 60).toString().padStart(2, "0")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
        </div>
    );
}