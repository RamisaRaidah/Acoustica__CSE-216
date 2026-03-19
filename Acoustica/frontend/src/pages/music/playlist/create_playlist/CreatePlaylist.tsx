import "@/pages/music/playlist/create_playlist/CreatePlaylist.css"
import { useState, useRef, useEffect } from "react";
import { createPlaylist } from "@/services/music_service/playlists";
import Alert from "@/components/alert/TwoButtonAlert";
import Searchbar, { SongType } from "@/components/searchbar/Searchbar";
import default_cover from '@/assets/images/music/Default_Cover_Picture.png';

export default function CreatePlaylist() {
    const formRef = useRef<HTMLFormElement>(null);
    const [creating, setCreating] = useState<boolean>(false);

    const [title, setTitle] = useState<string>('');
    const [cover_picture, setCoverPicture] = useState<string>('');
    const [privacy, setPrivacy] = useState<string>('');
    const [selectedSongs, setSelectedSongs] = useState<SongType[]>([]);
    const [selectedSongId, setSelectedSongId] = useState<number[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const visibilityOptions = [
        { label: "Private", value: "private" },
        { label: "Public", value: "public" }
    ];


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
        setCoverPicture('');
        setPrivacy('');
        setSelectedSongs([]);
        setSelectedSongId([]);
        setDuration(0);

        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
        const placeholder = document.getElementById("cover-placeholder");
        if (imgEl) { imgEl.src = ""; imgEl.style.display = "none"; }
        if (placeholder) placeholder.style.display = "flex";
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        formData.append('songs', JSON.stringify(selectedSongId));
        
        if (formData.get('playlist_title')?.toString().trim() === '') {
            setAlertMessage('Please select a title!');
            return;
        }
        else if (formData.get('visibility')?.toString().trim() === '') {
            setAlertMessage('Please select visibility!');
            return;
        }

        try {
            setCreating(true);
            const response = await createPlaylist(formData);
            if (response) {
                resetForm();
                setAlertMessage("The playlist is created successfully!"); 
            }
        } 
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create the playlist!';
            console.log('ERROR: ', message);
            if (message === 'exists') setAlertMessage('A playlist with the same title exists!');
            else setAlertMessage('Failed to create the playlist!');
        } 
        finally {
            setCreating(false);  
        }
    }

    function handleAddSong(song: SongType) {
        if (!selectedSongs.some(x => x.song_id === song.song_id)) {
            setSelectedSongs([...selectedSongs, song]);
            setSelectedSongId([...selectedSongId, song.song_id]);
        }
    }

    useEffect(() => {
        const total = selectedSongs.reduce((sum, s) => sum + s.length, 0);
        setDuration(total);
    }, [selectedSongs]);


    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    return (
        <div id="create-playlist-container">
            {alertMessage && <Alert message={alertMessage} type="alert" onConfirm={() => setAlertMessage(null)}/>}

            <form
                ref={formRef}
                id="create-playlist-form"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                autoComplete="off"
            >
                <div id="create-playlist-form-left">

                    <div id="create-playlist-header">
                        <h1>Create playlist</h1>
                    </div>
                    
                    <div className="form-group">
                        <label>Playlist Title <span style={{ color: "#e07b2a" }}>*</span></label>
                        <input
                            type="text"
                            name="playlist_title"
                            placeholder="Enter playlist title"
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Playlist description…"
                        />
                    </div>

                    <div id="create-playlist-form-left-bottom">

                        <div className="form-group" id="cover-picture-container">
                            <label>Cover Picture</label>
                            <div
                                id="cover-picture"
                                onClick={() => document.getElementById("cover-input")?.click()}
                            >
                                <img id="cover-preview" src={cover_picture} />
                                <div id="cover-placeholder">
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
                                        if (imgEl && file) {
                                            setCoverPicture(URL.createObjectURL(file));
                                            imgEl.style.display = "block";
                                            if (placeholder) placeholder.style.display = "none";
                                        } else if (imgEl) {
                                            setCoverPicture('');
                                            imgEl.style.display = "none";
                                            if (placeholder) placeholder.style.display = "flex";
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div id="create-playlist-form-left-bottom-right">

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
                                    opacity: creating ? 0.5 : 1,
                                    pointerEvents: creating ? "none" : "auto"
                                }}
                            >
                                {creating ? "Creating…" : "Create Playlist"}
                            </button>

                        </div>
                    </div>
                </div>

                <div id="create-playlist-form-right">
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
                                <Searchbar prompt="Add songs…" song onSongSelect={handleAddSong} />
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
                                            <p className="song-artist">{song.artist_name}</p>
                                        </div>

                                        <div className="col-album">{song.album_name}</div>

                                        <div className="col-time">
                                            {Math.floor(song.length / 60)}:{(song.length % 60).toString().padStart(2, "0")}
                                        </div>

                                        <div className="col-action">
                                            <span
                                                onClick={() => {
                                                    setSelectedSongs(selectedSongs.filter(s => s.song_id !== song.song_id));
                                                    setSelectedSongId(selectedSongId.filter(s => s !== song.song_id));
                                                }}
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