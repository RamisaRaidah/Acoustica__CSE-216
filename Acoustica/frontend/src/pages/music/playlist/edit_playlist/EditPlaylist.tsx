import '@/pages/music/playlist/edit_playlist/EditPlaylist.css';
import { useState, useRef, useEffect } from "react";
import { getPlaylistDetails, getPlaylistSongs, editPlaylist } from "@/services/music_service/playlists";
import { SongInfo } from '@/services/music_service/songs';
import Alert from "@/components/alert/TwoButtonAlert";
import Searchbar from "@/components/searchbar/Searchbar";
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditPlaylist() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { playlist_id } = useParams<{ playlist_id: string }>();
    const playlistId = Number(playlist_id);
    const formRef = useRef<HTMLFormElement>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [cover_picture, setCoverPicture] = useState<string | null>(null);
    const [privacy, setPrivacy] = useState<string>('');
    const [selectedSongs, setSelectedSongs] = useState<SongInfo[]>([]);
    const [selectedSongId, setSelectedSongId] = useState<number[]>([]);
    const [addedSongId, setAddedSongId] = useState<number[]>([]);
    const [deletedSongId, setDeletedSongId] = useState<number[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [coverAction, setCoverAction] = useState<'keep' | 'replace'>('keep');

    const visibilityOptions = [
        { label: "Private", value: "private" },
        { label: "Public", value: "public" }
    ];

    useEffect(() => {
        async function loadData() {
            try {
                const [playlist, songs] = await Promise.all([
                    getPlaylistDetails(playlistId),
                    getPlaylistSongs(playlistId)
                ]);
                setTitle(playlist.title);
                setDescription(playlist.description);
                setCoverPicture(playlist.cover_picture_url);
                setPrivacy(playlist.visibility);
                setSelectedSongs(songs);
                setSelectedSongId(songs.map(x => x.song_id));
            }
            catch (err) {
                console.log("ERROR:", err);
                setError('Failed to load data!');
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const dropdown = document.getElementById("visibility-dropdown");
            if (dropdown && !dropdown.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function resetForm() {
        formRef.current?.reset();
        setTitle('');
        setDescription('');
        setCoverPicture(null);
        setPrivacy('');
        setSelectedSongs([]);
        setSelectedSongId([]);
        setAddedSongId([]);
        setDeletedSongId([]);
        setDuration(0);

        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
        const placeholder = document.getElementById("cover-placeholder");
        if (imgEl) { imgEl.src = ""; imgEl.style.display = "none"; }
        if (placeholder) placeholder.style.display = "flex";
    }

    async function handleSubmit() {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        formData.append('added_songs', JSON.stringify(addedSongId));
        formData.append('deleted_songs', JSON.stringify(deletedSongId));
        formData.append('cover_action', coverAction);

        if (!formData.get('playlist_title')?.toString().trim()) {
            setAlertMessage('Please enter a title!');
            return;
        }
        else if (!formData.get('visibility')?.toString().trim()) {
            setAlertMessage('Please select visibility!');
            return;
        }

        try {
            setUpdating(true);
            const response = await editPlaylist(playlistId, formData);
            if (response) {
                resetForm();
                setAlertMessage("The playlist is updated successfully!");
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update the playlist!";
            console.log('ERROR: ', message);
            if (message === 'exists') setAlertMessage('A playlist with the same title exists!');
            else setAlertMessage('Failed to update the playlist!');
        }
        finally {
            setUpdating(false);
        }
    }

    function handleAddSong(song: SongInfo) {
        if (!selectedSongs.some(x => x.song_id === song.song_id)) {
            setSelectedSongs([...selectedSongs, song]);
            setSelectedSongId([...selectedSongId, song.song_id]);
            setAddedSongId([...addedSongId, song.song_id]);
            setDeletedSongId(deletedSongId.filter(s => s !== song.song_id));
        }
    }

    function handleDeleteSong(song: SongInfo) {
        setSelectedSongs(selectedSongs.filter(s => s.song_id !== song.song_id));
        setSelectedSongId(selectedSongId.filter(s => s !== song.song_id));
        setDeletedSongId([...deletedSongId, song.song_id]);
        setAddedSongId(addedSongId.filter(s => s !== song.song_id));
    }

    useEffect(() => {
        const total = selectedSongs.reduce((sum, s) => sum + s.length, 0);
        setDuration(total);
    }, [selectedSongs]);


    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    if (loading) return <div className='loading'>Loading</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id="edit-playlist-container">
            {alertMessage && <Alert message={alertMessage} type="alert" onConfirm={() => { setAlertMessage(null); if (alertMessage === "The playlist is updated successfully!") navigate(`/music/playlists/${playlistId}`) }} />}
            {confirmation && <Alert message='Are you sure to apply the changes?' type='confirm' onConfirm={() => { setConfirmation(false); handleSubmit() }} onCancel={() => setConfirmation(false)}/>}

            <form
                ref={formRef}
                id="edit-playlist-form"
                encType="multipart/form-data"
                onSubmit={(e) => { e.preventDefault(); setConfirmation(true) }}
                autoComplete="off"
            >
                <div id="edit-playlist-form-left">

                    <div id="edit-playlist-header">
                        <h1>Update Playlist</h1>
                    </div>

                    <div className="form-group">
                        <label>Playlist Title <span style={{ color: "#e07b2a" }}>*</span></label>
                        <input
                            type="text"
                            name="playlist_title"
                            placeholder="Enter playlist title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Playlist description…"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div id="edit-playlist-form-left-bottom">

                        <div className="form-group" id="cover-picture-container">
                            <label>Cover Picture</label>
                            <div
                                id="cover-picture"
                                onClick={() => document.getElementById("cover-input")?.click()}
                            >
                                <img id="cover-preview" src={cover_picture ?? ''} style={{display: cover_picture ? "block" : "none"}} />
                                <div id="cover-placeholder" style={{display: cover_picture ? "none" : "flex"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <span>Add Cover</span>
                                </div>
                                <input
                                    id="cover-input"
                                    type="file"
                                    name="cover_picture"
                                    accept=".jpg,.png,.jpeg"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
                                        const placeholder = document.getElementById("cover-placeholder");
                                        setCoverAction('replace');
                                        if (imgEl && file) {
                                            setCoverPicture(URL.createObjectURL(file));
                                            imgEl.style.display = "block";
                                            if (placeholder) placeholder.style.display = "none";
                                        } 
                                        else if (imgEl) {
                                            setCoverPicture(null);
                                            imgEl.style.display = "none";
                                            if (placeholder) placeholder.style.display = "flex";
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div id="edit-playlist-form-left-bottom-right">

                            <div className="form-group">
                                <label>Visibility <span style={{ color: "#e07b2a" }}>*</span></label>
                                <div id="visibility-dropdown">
                                    <div
                                        id="visibility-selected"
                                        onClick={() => setIsDropdownOpen(prev => !prev)}
                                    >
                                        <span>
                                            {visibilityOptions.find(v => v.value === privacy)?.label || "Select visibility"}
                                        </span>
                                        <svg
                                            className={isDropdownOpen ? "rotate" : ""}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>

                                    {isDropdownOpen && (
                                        <div id="visibility-options">
                                            {visibilityOptions.map(option => (
                                                <div
                                                    key={option.value}
                                                    className={`visibility-option ${privacy === option.value ? "active" : ""}`}
                                                    onClick={() => {
                                                        setPrivacy(option.value);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <input type="hidden" name="visibility" value={privacy} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    opacity: updating ? 0.5 : 1,
                                    pointerEvents: updating ? "none" : "auto"
                                }}
                            >
                                {updating ? "Updating…" : "Update Playlist"}
                            </button>

                        </div>
                    </div>
                </div>

                <div id="edit-playlist-form-right">
                    <div id="playlist-card">

                        <div id="playlist-card-top">
                            <div id="card-cover-picture">
                                <img src={cover_picture || default_cover} alt="Playlist cover" />
                            </div>

                            <div id="card-info">
                                <p id="playlist-label">Playlist</p>
                                <h2 id="playlist-title">{title || "Untitled"}</h2>
                                <div id="playlist-meta">
                                    <span>{privacy || ""}</span>
                                    {
                                        selectedSongs.length > 0 &&
                                        <>
                                            <span>•</span>
                                            <span>{selectedSongs.length} {selectedSongs.length > 1 ? "songs" : "song"}</span>
                                            <span>•</span>
                                            <span>
                                                {hrs > 0 && `${hrs} hr `}
                                                {mins > 0 && `${mins} min `}
                                                {secs > 0 && `${secs} sec `}
                                            </span>
                                        </>
                                    }
                                </div>
                            </div>

                            <div id="search-song">
                                <Searchbar prompt="Add songs…" song onSongSelect={handleAddSong} prevent_default />
                            </div>
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
                                {selectedSongs.map((song, index) => (
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

                                        <div className="col-action">
                                            <span
                                                onClick={() => handleDeleteSong(song)}
                                                title="Remove"
                                            >
                                                ✕
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}