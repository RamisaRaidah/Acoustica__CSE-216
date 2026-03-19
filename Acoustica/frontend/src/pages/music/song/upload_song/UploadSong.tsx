import '@/pages/music/song/upload_song/UploadSong.css';
import { getMyAlbums, GetMyAlbumsResponse } from '@/services/music_service/albums';
import { getArtists, GetArtistsResponse } from '@/services/user_service/artists';
import { getLanguages, Language, getGenres, Genre, getMoods, Mood, getInstruments, Instrument } from '@/services/analytics_service/analytics';
import { uploadSong } from '@/services/music_service/songs';
import { useEffect, useState, useRef } from 'react';
import { DatePicker, DatePickerHandle } from '@/components/date_picker/DatePicker';
import Alert from '@/components/alert/TwoButtonAlert';
import { useNavigate } from 'react-router-dom';

interface Collaborator {
    artist_id: number;
    artist_name: string;
    profile_picture_url: string;
    role: string;
}

export default function UploadSong() {
    const [albums, setAlbums] = useState<GetMyAlbumsResponse[]>([]);
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);
    const [pendingArtist, setPendingArtist] = useState<GetArtistsResponse | null>(null);
    const [selectedCollaborators, setSelectedCollaborators] = useState<Collaborator[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
    const [moods, setMoods] = useState<Mood[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<DatePickerHandle>(null);
    const navigate = useNavigate();

    const [collabDropdownOpen, setCollabDropdownOpen] = useState(false);
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
    const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
    const [instrumentDropdownOpen, setInstrumentDropdownOpen] = useState(false);

    const collabRef = useRef<HTMLDivElement>(null);
    const genreRef = useRef<HTMLDivElement>(null);
    const moodRef = useRef<HTMLDivElement>(null);
    const instrumentRef = useRef<HTMLDivElement>(null);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();
        setSelectedGenres([]);
        setSelectedMoods([]);
        setSelectedInstruments([]);
        setSelectedCollaborators([]);

        const songFileName = document.getElementById("song-file-name");
        const lyricsFileName = document.getElementById("lyrics-file-name");
        const ccFileName = document.getElementById("cc-file-name");
        if (songFileName) songFileName.textContent = "No file chosen";
        if (lyricsFileName) lyricsFileName.textContent = "No file chosen";
        if (ccFileName) ccFileName.textContent = "No file chosen";
    }

    useEffect(() => {
        async function loadData() {
            try {
                getMyAlbums().then(setAlbums);
                getArtists().then(setArtists);
                getLanguages().then(setLanguages);
                getGenres().then(setGenres);
                getMoods().then(setMoods);
                getInstruments().then(setInstruments);
            } catch (err) {
                console.log('Error:', err);
                setError('Failed to load!');
            } finally {
                setLoading(false);
                resetForm();
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (genreRef.current && !genreRef.current.contains(e.target as Node)) setGenreDropdownOpen(false);
            if (moodRef.current && !moodRef.current.contains(e.target as Node)) setMoodDropdownOpen(false);
            if (instrumentRef.current && !instrumentRef.current.contains(e.target as Node)) setInstrumentDropdownOpen(false);
            if (collabRef.current && !collabRef.current.contains(e.target as Node)) {
                setCollabDropdownOpen(false);
                setPendingArtist(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSelectArtist(artist: GetArtistsResponse) {
        setPendingArtist(artist);
    }

    function handleSelectRole(role: string) {
        if (!pendingArtist) return;
        setSelectedCollaborators(prev => [...prev, {
            artist_id: pendingArtist.artist_id,
            artist_name: pendingArtist.artist_name,
            profile_picture_url: pendingArtist.profile_picture_url,
            role,
        }]);
        setPendingArtist(null);
        setCollabDropdownOpen(false);
    }

    function removeCollaborator(id: number) {
        setSelectedCollaborators(prev => prev.filter(x => x.artist_id !== id));
    }

    function addGenre(id: number) {
        const item = genres.find(x => x.genre_id === id);
        if (item && !selectedGenres.some(x => x.genre_id === id)) {
            setSelectedGenres(prev => [...prev, item]);
        }
        setGenreDropdownOpen(false);
    }

    function removeGenre(id: number) {
        setSelectedGenres(prev => prev.filter(x => x.genre_id !== id));
    }

    function addMood(id: number) {
        const item = moods.find(x => x.mood_id === id);
        if (item && !selectedMoods.some(x => x.mood_id === id)) {
            setSelectedMoods(prev => [...prev, item]);
        }
        setMoodDropdownOpen(false);
    }

    function removeMood(id: number) {
        setSelectedMoods(prev => prev.filter(x => x.mood_id !== id));
    }

    function addInstrument(id: number) {
        const item = instruments.find(x => x.instrument_id === id);
        if (item && !selectedInstruments.some(x => x.instrument_id === id)) {
            setSelectedInstruments(prev => [...prev, item]);
        }
        setInstrumentDropdownOpen(false);
    }

    function removeInstrument(id: number) {
        setSelectedInstruments(prev => prev.filter(x => x.instrument_id !== id));
    }

    if (loading) return <div className='loading'>Loading...</div>;
    if (error) return <div className='error'>{error}</div>;

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        formData.append('collaborators', JSON.stringify(
            selectedCollaborators.map(c => `${c.artist_id}:${c.role}`)
        ));

        if (!formData.get('song_title')?.toString().trim()) {
            setAlertMessage('Please enter a title!');
            return;
        }
        else if (!formData.get('album_id')?.toString().trim()) {
            setAlertMessage('Please select an album!');
            return;
        }
        else if (!formData.get('language')?.toString().trim()) {
            setAlertMessage('Please select a language!');
            return;
        }
        else if (formData.getAll('genres').length === 0) {
            setAlertMessage('Please select atleast one genre!');
            return;
        }
        else if (formData.getAll('moods').length === 0) {
            setAlertMessage('Please select atleast one mood!');
            return;
        }
        else if (formData.getAll('instruments').length === 0) {
            setAlertMessage('Please select atleast one instrument!');
            return;
        }
        else if (!formData.get('release_date')?.toString().trim()) {
            setAlertMessage('Please enter the release date!');
            return;
        }
        else if (!(formData.get('song_audio') as File).name) {
            setAlertMessage('Please select the audio file!');
            return;
        }
        else if (!(formData.get('copyright_certificate') as File).name) {
            setAlertMessage('Please provide copyright certificate!');
            return;
        }

        try {
            setUploading(true);
            const response = await uploadSong(formData);
            if (response) {
                resetForm();
                setAlertMessage('The song is uploaded successfully!');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload the song!';
            console.log('ERROR:', message);
            if (message === 'exists') setAlertMessage('A song with the same title exists!');
            else setAlertMessage('Failed to upload the song!');
        }
        finally {
            setUploading(false);
        }
    }

    return (
        <div id='upload-song-container'>
            {alertMessage && <Alert message={alertMessage} type='alert' onConfirm={() => setAlertMessage(null)} />}

            <div id="create-album-header">
                <h1>Upload Song</h1>
            </div>

            <form ref={formRef} id='upload-song-form' encType='multipart/form-data' onSubmit={handleSubmit} autoComplete='off'>

                <div id='upload-song-form-left'>

                    <div id='upload-song-form-left-top'>

                        <div className='form-group'>
                            <label>Song Title<span style={{ color: "#e07b2a" }}>*</span></label>
                            <input type='text' name='song_title' placeholder='Enter song title' />
                        </div>

                        <div className='form-group'>
                            <label>Album<span style={{ color: "#e07b2a" }}>*</span></label>
                            <select name='album_id' defaultValue=''>
                                <option value='' disabled>Select an album</option>
                                {albums.map(album => (
                                    <option key={album.album_id} value={album.album_id}>{album.title}</option>
                                ))}
                            </select>
                            <button type='button' id='new-album-button' onClick={() => navigate('/music/create-album')}>+ Create new album</button>
                        </div>

                    </div>

                    <div id='upload-song-form-left-middle'>

                        <div className='form-group'>
                            <label>Collaborators</label>
                            <div className='multi-select-wrapper' ref={collabRef}>
                                <div
                                    className={`multi-select-box ${collabDropdownOpen ? 'active' : ''}`}
                                    onClick={() => { setCollabDropdownOpen(o => !o); setPendingArtist(null); }}
                                >
                                    <span className='multi-select-placeholder'>Add collaborator</span>
                                    <span className='file-btn multi-select-btn'>+</span>
                                </div>
                                {collabDropdownOpen && (
                                    <div className='multi-select-dropdown'>
                                        {pendingArtist === null
                                            ? artists
                                                .filter(a => !selectedCollaborators.some(c => c.artist_id === a.artist_id))
                                                .map(a => (
                                                    <div key={a.artist_id} className='multi-select-option' onClick={() => handleSelectArtist(a)}>
                                                        {a.artist_name}
                                                    </div>
                                                ))
                                            : <>
                                                <div className='multi-select-back' onClick={() => setPendingArtist(null)}>
                                                    ← {pendingArtist.artist_name}
                                                </div>
                                                {['Vocalist', 'Lyricist', 'Composer'].map(role => (
                                                    <div key={role} className='multi-select-option' onClick={() => handleSelectRole(role)}>
                                                        {role}
                                                    </div>
                                                ))}
                                            </>
                                        }
                                    </div>
                                )}
                            </div>
                            <div className='selected-tags'>
                                {selectedCollaborators.map(c => (
                                    <div key={c.artist_id} className='selected-tag'>
                                        <span>{c.artist_name}</span>
                                        <span className='tag-role'>{c.role}</span>
                                        <button type='button' className='tag-remove-btn' onClick={() => removeCollaborator(c.artist_id)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='form-group'>
                            <label>Language<span style={{ color: "#e07b2a" }}>*</span></label>
                            <select name='language' defaultValue=''>
                                <option value='' disabled>Select language</option>
                                {languages.map(language => (
                                    <option key={language.language_id} value={language.language_id}>{language.language_name}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div id='upload-song-form-left-bottom'>

                        <div className='form-group'>
                            <label>Genre</label>
                            <div className='multi-select-wrapper' ref={genreRef}>
                                <div
                                    className={`multi-select-box ${genreDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setGenreDropdownOpen(o => !o)}
                                >
                                    <span className='multi-select-placeholder'>Add genre</span>
                                    <span className='file-btn multi-select-btn'>+</span>
                                </div>
                                {genreDropdownOpen && (
                                    <div className='multi-select-dropdown'>
                                        {genres.filter(x => !selectedGenres.some(y => y.genre_id === x.genre_id)).length === 0
                                            ? <div className='multi-select-empty'>All genres added</div>
                                            : genres
                                                .filter(x => !selectedGenres.some(y => y.genre_id === x.genre_id))
                                                .map(x => (
                                                    <div key={x.genre_id} className='multi-select-option' onClick={() => addGenre(x.genre_id)}>
                                                        {x.genre_name}
                                                    </div>
                                                ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className='selected-tags'>
                                {selectedGenres.map(x => (
                                    <div key={x.genre_id} className='selected-tag'>
                                        <span>{x.genre_name}</span>
                                        <button type='button' className='tag-remove-btn' onClick={() => removeGenre(x.genre_id)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {selectedGenres.map(x => (
                                <input key={x.genre_id} type='hidden' name='genres' value={x.genre_id} />
                            ))}
                        </div>

                        <div className='form-group'>
                            <label>Mood</label>
                            <div className='multi-select-wrapper' ref={moodRef}>
                                <div
                                    className={`multi-select-box ${moodDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setMoodDropdownOpen(o => !o)}
                                >
                                    <span className='multi-select-placeholder'>Add mood</span>
                                    <span className='file-btn multi-select-btn'>+</span>
                                </div>
                                {moodDropdownOpen && (
                                    <div className='multi-select-dropdown'>
                                        {moods.filter(x => !selectedMoods.some(y => y.mood_id === x.mood_id)).length === 0
                                            ? <div className='multi-select-empty'>All moods added</div>
                                            : moods
                                                .filter(x => !selectedMoods.some(y => y.mood_id === x.mood_id))
                                                .map(x => (
                                                    <div key={x.mood_id} className='multi-select-option' onClick={() => addMood(x.mood_id)}>
                                                        {x.mood_name}
                                                    </div>
                                                ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className='selected-tags'>
                                {selectedMoods.map(x => (
                                    <div key={x.mood_id} className='selected-tag'>
                                        <span>{x.mood_name}</span>
                                        <button type='button' className='tag-remove-btn' onClick={() => removeMood(x.mood_id)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {selectedMoods.map(x => (
                                <input key={x.mood_id} type='hidden' name='moods' value={x.mood_id} />
                            ))}
                        </div>

                        <div className='form-group'>
                            <label>Instrument</label>
                            <div className='multi-select-wrapper' ref={instrumentRef}>
                                <div
                                    className={`multi-select-box ${instrumentDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setInstrumentDropdownOpen(o => !o)}
                                >
                                    <span className='multi-select-placeholder'>Add instrument</span>
                                    <span className='file-btn multi-select-btn'>+</span>
                                </div>
                                {instrumentDropdownOpen && (
                                    <div className='multi-select-dropdown'>
                                        {instruments.filter(x => !selectedInstruments.some(y => y.instrument_id === x.instrument_id)).length === 0
                                            ? <div className='multi-select-empty'>All instruments added</div>
                                            : instruments
                                                .filter(x => !selectedInstruments.some(y => y.instrument_id === x.instrument_id))
                                                .map(x => (
                                                    <div key={x.instrument_id} className='multi-select-option' onClick={() => addInstrument(x.instrument_id)}>
                                                        {x.instrument_name}
                                                    </div>
                                                ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className='selected-tags'>
                                {selectedInstruments.map(x => (
                                    <div key={x.instrument_id} className='selected-tag'>
                                        <span>{x.instrument_name}</span>
                                        <button type='button' className='tag-remove-btn' onClick={() => removeInstrument(x.instrument_id)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {selectedInstruments.map(x => (
                                <input key={x.instrument_id} type='hidden' name='instruments' value={x.instrument_id} />
                            ))}
                        </div>

                    </div>

                </div>

                <div id='upload-song-form-right'>

                    <div className="form-group">
                        <label>Release Date<span style={{ color: "#e07b2a" }}>*</span></label>
                        <DatePicker ref={datePickerRef} name="release_date" />
                    </div>

                    <div className="form-group">
                        <label>Song audio<span style={{ color: "#e07b2a" }}>*</span></label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name" id="song-file-name">No file chosen</span>
                            <input type="file" name="song_audio" accept=".mp3, .wav"
                                onChange={e => {
                                    const el = document.getElementById("song-file-name");
                                    if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                }}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Lyrics</label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name" id="lyrics-file-name">No file chosen</span>
                            <input type="file" name="lyrics" accept=".txt"
                                onChange={e => {
                                    const el = document.getElementById("lyrics-file-name");
                                    if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                }}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Copyright Certificate<span style={{ color: "#e07b2a" }}>*</span></label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name" id="cc-file-name">No file chosen</span>
                            <input type="file" name="copyright_certificate" accept=".pdf"
                                onChange={e => {
                                    const el = document.getElementById("cc-file-name");
                                    if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                }}
                            />
                        </label>
                    </div>

                    <button type='submit' style={{ opacity: uploading ? 0.4 : 1, pointerEvents: uploading ? "none" : "auto" }}>
                        {uploading ? "Uploading..." : "Upload"}
                    </button>

                </div>

            </form>
        </div>
    );
}