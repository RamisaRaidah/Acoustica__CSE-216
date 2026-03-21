import '@/pages/music/song/edit_song/EditSong.css';
import { getMyAlbums, GetMyAlbumsResponse } from '@/services/music_service/albums';
import { getArtists, GetArtistsResponse } from '@/services/user_service/artists';
import { getLanguages, Language, getGenres, Genre, getMoods, Mood, getInstruments, Instrument } from '@/services/analytics_service/analytics';
import { getSongMetadata, getSongCollaborators, Collaborator, getSongGenres, getSongMoods, getSongInstruments, getSongLyrics } from '@/services/music_service/songs';
import { updateSong } from '@/services/music_service/songs';
import { useEffect, useState, useRef } from 'react';
import { DatePicker, DatePickerHandle } from '@/components/date_picker/DatePicker';
import Alert from '@/components/alert/TwoButtonAlert';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditSong() {
    const { song_id } = useParams<{ song_id: string }>();
    const songId = Number(song_id);
    const [title, setTitle] = useState<string>('');
    const [album_id, setAlbumId] = useState<string>('');
    const [language_id, setLanguageId] = useState<string>('');
    const [release_date, setReleaseDate] = useState<string>('');
    const [albums, setAlbums] = useState<GetMyAlbumsResponse[]>([]);
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);
    const [pendingArtist, setPendingArtist] = useState<GetArtistsResponse | null>(null);
    const [selectedCollaborators, setSelectedCollaborators] = useState<Collaborator[]>([]);
    const [addedCollaborators, setAddedCollaborators] = useState<Collaborator[]>([]);
    const [deletedCollaborators, setDeletedCollaborators] = useState<Collaborator[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
    const [addedGenres, setAddedGenres] = useState<number[]>([]);
    const [deletedGenres, setDeletedGenres] = useState<number[]>([]);
    const [moods, setMoods] = useState<Mood[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
    const [addedMoods, setAddedMoods] = useState<number[]>([]);
    const [deletedMoods, setDeletedMoods] = useState<number[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
    const [addedInstruments, setAddedInstruments] = useState<number[]>([]);
    const [deletedInstruments, setDeletedInstruments] = useState<number[]>([]);
    const [lyrics, setLyrics] = useState<string>('');
    const [copyright_certificate, setCopyrightCertificate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [lyrics_action, setLyricsAction] = useState<'keep' | 'replace'>('keep');
    const [copyright_certificate_action, setCopyrightCertificateAction] = useState<'keep' | 'replace'>('keep');
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

    const lyricsInputRef = useRef<HTMLInputElement>(null);
    const ccInputRef = useRef<HTMLInputElement>(null);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();
        setSelectedGenres([]);
        setSelectedMoods([]);
        setSelectedInstruments([]);
        setSelectedCollaborators([]);
        setTitle('');
        setReleaseDate('');
        setAlbumId('');
        setLanguageId('');
        setLyrics('No file chosen');
        setCopyrightCertificate('No file chosen')
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
            }
            catch (err) {
                console.log('Error:', err);
                setError('Failed to load!');
            }
            finally {
                setLoading(false);
                resetForm();
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        async function loadSongData() {
            try {
                getSongMetadata(songId).then(info => {
                    setTitle(info.title);
                    setAlbumId(String(info.album_id));
                    setLanguageId(String(info.language_id));
                    const d = new Date(info.release_date);
                    const formattedDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                    setReleaseDate(formattedDate);
                    setCopyrightCertificate(`${info.title.toLowerCase().replace(' ', '_')}_copyright_certificate.pdf`);
                    getSongLyrics(songId).then(res => {
                        if (res.lyrics !== "no lyrics") setLyrics(`${info.title.toLowerCase().replace(' ', '_')}_lyrics.txt`);
                    })
                });
                getSongCollaborators(songId).then(setSelectedCollaborators);
                getSongGenres(songId).then(setSelectedGenres);
                getSongMoods(songId).then(setSelectedMoods);
                getSongInstruments(songId).then(setSelectedInstruments);
            }
            catch (err) {
                console.log('Error:', err);
                setError('Failed to load!');
            }
            finally {
                setLoading(false);
            }
        }
        loadSongData();
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
            role,
        }]);
        setAddedCollaborators(prev => [...prev, {
            artist_id: pendingArtist.artist_id,
            artist_name: pendingArtist.artist_name,
            role,
        }]);
        setDeletedCollaborators(deletedCollaborators.filter(x => !(x.artist_id === pendingArtist.artist_id && x.role === role)))
        setPendingArtist(null);
        setCollabDropdownOpen(false);
    }

    function removeCollaborator(c: Collaborator) {
        setSelectedCollaborators(prev => prev.filter(x => !(x.artist_id === c.artist_id && x.role === c.role)));
        setDeletedCollaborators(prev => [...prev, c]);
        setAddedCollaborators(addedCollaborators.filter(x => !(x.artist_id === c.artist_id && x.role === c.role)));
    }

    function addGenre(id: number) {
        const item = genres.find(x => x.genre_id === id);
        if (item && !selectedGenres.some(x => x.genre_id === id)) {
            setSelectedGenres(prev => [...prev, item]);
            setAddedGenres(prev => [...prev, id]);
            setDeletedGenres(deletedGenres.filter(x => x !== id));
        }
        setGenreDropdownOpen(false);
    }

    function removeGenre(id: number) {
        setSelectedGenres(prev => prev.filter(x => x.genre_id !== id));
        setDeletedGenres(prev => [...prev, id]);
        setAddedGenres(addedGenres.filter(x => x !== id));
    }

    function addMood(id: number) {
        const item = moods.find(x => x.mood_id === id);
        if (item && !selectedMoods.some(x => x.mood_id === id)) {
            setSelectedMoods(prev => [...prev, item]);
            setAddedMoods(prev => [...prev, id]);
            setDeletedMoods(deletedMoods.filter(x => x !== id));
        }
        setMoodDropdownOpen(false);
    }

    function removeMood(id: number) {
        setSelectedMoods(prev => prev.filter(x => x.mood_id !== id));
        setDeletedMoods(prev => [...prev, id]);
        setAddedMoods(addedMoods.filter(x => x !== id));
    }

    function addInstrument(id: number) {
        const item = instruments.find(x => x.instrument_id === id);
        if (item && !selectedInstruments.some(x => x.instrument_id === id)) {
            setSelectedInstruments(prev => [...prev, item]);
            setAddedInstruments(prev => [...prev, id]);
            setDeletedInstruments(deletedInstruments.filter(x => x !== id));
        }
        setInstrumentDropdownOpen(false);
    }

    function removeInstrument(id: number) {
        setSelectedInstruments(prev => prev.filter(x => x.instrument_id !== id));
        setDeletedInstruments(prev => [...prev, id]);
        setAddedInstruments(addedInstruments.filter(x => x !== id));
    }

    if (loading) return <div className='loading'>Loading...</div>;
    if (error) return <div className='error'>{error}</div>;

    async function handleSubmit() {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        formData.append('added_collaborators', JSON.stringify(
            addedCollaborators.map(c => `${c.artist_id}:${c.role}`)
        ));
        formData.append('deleted_collaborators', JSON.stringify(
            deletedCollaborators.map(c => `${c.artist_id}:${c.role}`)
        ));
        formData.append('added_genres', JSON.stringify(addedGenres));
        formData.append('deleted_genres', JSON.stringify(deletedGenres));
        formData.append('added_moods', JSON.stringify(addedMoods));
        formData.append('deleted_moods', JSON.stringify(deletedMoods));
        formData.append('added_instruments', JSON.stringify(addedInstruments));
        formData.append('deleted_instruments', JSON.stringify(deletedInstruments));
        formData.append('lyrics_action', lyrics_action);
        formData.append('copyright_certificate_action', copyright_certificate_action);

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
        else if (selectedGenres.length === 0) {
            setAlertMessage('Please select atleast one genre!');
            return;
        }
        else if (selectedMoods.length === 0) {
            setAlertMessage('Please select atleast one mood!');
            return;
        }
        else if (selectedInstruments.length === 0) {
            setAlertMessage('Please select atleast one instrument!');
            return;
        }
        else if (!formData.get('release_date')?.toString().trim()) {
            setAlertMessage('Please enter the release date!');
            return;
        }

        try {
            setUpdating(true);
            const response = await updateSong(songId, formData);
            if (response) {
                resetForm();
                setAlertMessage('The song is updated successfully!');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update the song!';
            console.log('ERROR:', message);
            if (message === 'exists') setAlertMessage('A song with the same title exists!');
            else setAlertMessage('Failed to update the song!');
        }
        finally {
            setUpdating(false);
        }
    }

    return (
        <div id='edit-song-container'>
            {alertMessage && <Alert message={alertMessage} type="alert" onConfirm={() => { setAlertMessage(null); if (alertMessage === "The song is updated successfully!") navigate(`/music/songs/${songId}`) }} />}
            {confirmation && <Alert message='Are you sure to apply the changes?' type='confirm' onConfirm={() => { setConfirmation(false); handleSubmit() }} onCancel={() => setConfirmation(false)} />}

            <div id="create-album-header">
                <h1>Update Song</h1>
            </div>

            <form ref={formRef} id='edit-song-form' encType='multipart/form-data' onSubmit={(e) => { e.preventDefault(); setConfirmation(true); }} autoComplete='off'>

                <div id='edit-song-form-left'>

                    <div id='edit-song-form-left-top'>

                        <div className='form-group'>
                            <label>Song Title<span style={{ color: "#e07b2a" }}>*</span></label>
                            <input type='text' name='song_title' placeholder='Enter song title' value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className='form-group'>
                            <label>Album<span style={{ color: "#e07b2a" }}>*</span></label>
                            <select name='album_id' value={album_id} onChange={(e) => setAlbumId(e.target.value)}>
                                <option value='' disabled>Select an album</option>
                                {albums.map(album => (
                                    <option key={album.album_id} value={album.album_id}>{album.title}</option>
                                ))}
                            </select>
                            <button type='button' id='new-album-button' onClick={() => navigate('/music/create-album')}>+ Create new album</button>
                        </div>

                    </div>

                    <div id='edit-song-form-left-middle'>

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
                                            ? artists.map(a => (
                                                <div key={a.artist_id} className='multi-select-option' onClick={() => handleSelectArtist(a)}>
                                                    {a.artist_name}
                                                </div>
                                            ))
                                            : <>
                                                <div className='multi-select-back' onClick={() => setPendingArtist(null)}>
                                                    ← {pendingArtist.artist_name}
                                                </div>
                                                {['Vocalist', 'Lyricist', 'Composer']
                                                    .filter(role => !selectedCollaborators.some(
                                                        c => c.artist_id === pendingArtist.artist_id && c.role.toLowerCase() === role.toLowerCase()
                                                    ))
                                                    .map(role => (
                                                        <div key={role} className='multi-select-option' onClick={() => handleSelectRole(role)}>
                                                            {role}
                                                        </div>
                                                    ))
                                                }
                                            </>
                                        }
                                    </div>
                                )}
                            </div>
                            <div className='selected-tags'>
                                {selectedCollaborators.map(c => (
                                    <div key={`${c.artist_id}-${c.role}`} className='selected-tag'>
                                        <span>{c.artist_name}</span>
                                        <span className='tag-role'>{c.role}</span>
                                        <button type='button' className='tag-remove-btn' onClick={() => removeCollaborator(c)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='form-group'>
                            <label>Language<span style={{ color: "#e07b2a" }}>*</span></label>
                            <select name='language' value={language_id} onChange={(e) => setLanguageId(e.target.value)}>
                                <option value='' disabled>Select a language</option>
                                {languages.map(language => (
                                    <option key={language.language_id} value={language.language_id}>{language.language_name}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div id='edit-song-form-left-bottom'>

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
                        </div>

                    </div>

                </div>

                <div id='edit-song-form-right'>

                    <div className="form-group">
                        <label>Release Date<span style={{ color: "#e07b2a" }}>*</span></label>
                        <DatePicker ref={datePickerRef} name="release_date" initialValue={release_date} />
                    </div>

                    <div className="form-group">
                        <label>Lyrics</label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name">{lyrics}</span>
                            {lyrics && lyrics !== 'No file chosen' && (
                                <button type='button' className='tag-remove-btn' onClick={(e) => {
                                    e.preventDefault();
                                    setLyrics('No file chosen');
                                    setLyricsAction('replace'); 
                                    if (lyricsInputRef.current) lyricsInputRef.current.value = '';
                                }}>×</button>
                            )}
                            <input ref={lyricsInputRef} type="file" name="lyrics" accept=".txt"
                                onChange={e => {
                                    setLyricsAction('replace');
                                    setLyrics(e.target.files?.[0]?.name ?? 'No file chosen');
                                }}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Copyright Certificate<span style={{ color: "#e07b2a" }}>*</span></label>
                        <label className="file-input-wrapper">
                            <span className="file-btn">+</span>
                            <span className="file-name">{copyright_certificate}</span>
                            {copyright_certificate && copyright_certificate !== 'No file chosen' && (
                                <button type='button' className='tag-remove-btn' onClick={(e) => {
                                    e.preventDefault();
                                    setCopyrightCertificate('No file chosen');
                                    setCopyrightCertificateAction('keep'); 
                                    if (ccInputRef.current) ccInputRef.current.value = '';
                                }}>×</button>
                            )}
                            <input ref={ccInputRef} type="file" name="copyright_certificate" accept=".pdf"
                                onChange={(e) => {
                                    setCopyrightCertificateAction('replace');
                                    setCopyrightCertificate(e.target.files?.[0]?.name ?? 'No file chosen');
                                }}
                            />
                        </label>
                    </div>

                    <button type='submit' style={{ opacity: updating ? 0.4 : 1, pointerEvents: updating ? "none" : "auto" }}>
                        {updating ? "Updating..." : "Update song"}
                    </button>

                </div>

            </form>
        </div>
    );
}