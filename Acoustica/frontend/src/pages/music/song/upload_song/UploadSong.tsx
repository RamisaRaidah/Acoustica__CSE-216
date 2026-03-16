import '@/pages/music/song/upload_song/UploadSong.css';
import { getMyAlbums, GetMyAlbumsResponse } from '@/services/music_service/albums';
import { getArtists, GetArtistsResponse } from '@/services/user_service/artists';
import { getLanguages, Language, getGenres, Genre, getMoods, Mood, getInstruments, Instrument } from '@/services/analytics_service/analytics';
import { uploadSong } from '@/services/music_service/songs';
import { useEffect, useState, useRef } from 'react';
import { DatePicker, DatePickerHandle } from '@/components/date_picker/DatePicker';
import Alert from '@/components/alert/Alert';

export default function UploadSong() {
    const [albums, setAlbums] = useState<GetMyAlbumsResponse[]>([]);
    const [artists, setArtists] = useState<GetArtistsResponse[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [moods, setMoods] = useState<Mood[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<DatePickerHandle>(null);

    function resetForm() {
        formRef.current?.reset();
        datePickerRef.current?.reset();

        const imgEl = document.getElementById("cover-preview") as HTMLImageElement;
        const placeholder = document.getElementById("cover-placeholder");
        if (imgEl) { imgEl.src = ""; imgEl.style.display = "none"; }
        if (placeholder) placeholder.style.display = "flex";

        const certName = document.getElementById("cert-name");
        if (certName) certName.textContent = "No file chosen";
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

    if (loading) return <div className='loading'>Loading...</div>;
    if (error) return <div className='error'>{error}</div>;

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!formRef.current) return;

        const formData = new FormData(formRef.current);

        try {
            setUploading(true);
            const response = await uploadSong(formData);
            if (response) setAlertMessage('The song is uploaded successfully!');
        }
        catch (err) {
            console.log('ERROR', err);
            setAlertMessage('Failed to upload the song!');
        }
        finally {
            setUploading(false);
        }
    }

    return (
        <div id='upload-song-container'>
            {alertMessage && <Alert message={alertMessage} />}

            <div id="create-album-header">
                <h1>Upload Song</h1>
            </div>

            <form ref={formRef} id='upload-song-form' encType='multipart/form-data' onSubmit={handleSubmit} autoComplete='off'>

                <div id='upload-song-form-top'>
                    <div id='upload-song-form-left'>

                        <div className='form-group'>
                            <label>Song Title<span style={{ color: "red" }}>*</span></label>
                            <input
                                type='text'
                                name='song_title'
                                placeholder='Enter song title'
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>Album<span style={{ color: "red" }}>*</span></label>
                            <div className='input-group'>
                                <select name='album_id' required>
                                    <option value='' disabled selected>Select an album</option>
                                    {
                                        albums.map(album => (
                                            <option value={album.album_id}>{album.title}</option>
                                        ))
                                    }
                                </select>

                                <button type='button' id='new-album-button'>
                                    + Create new album
                                </button>
                            </div>
                        </div>

                        <div className='form-group'>
                            <label>Collaborators</label>

                            <div className='input-group'>
                                <select id='collaborator-select'>
                                    <option value='' disabled selected>Select collaborator</option>
                                    {
                                        artists.map(artist => (
                                            <option value={artist.artist_id}>{artist.artist_name}</option>
                                        ))
                                    }
                                </select>

                                <select id='collaborator-role-select'>
                                    <option value='' disabled selected>Select role</option>
                                    <option value='vocalist'>Vocalist</option>
                                    <option value='lyricist'>Lyricist</option>
                                    <option value='composer'>Composer</option>
                                </select>
                            </div>

                            <div id='selected-collaborators' className='selected-items'></div>

                            <input type='hidden' name='collaborators' id='collaborators-input' />
                        </div>
                    </div>

                    <div id='upload-song-form-right'>

                        <div className='form-group'>
                            <label>Language<span style={{ color: "red" }}>*</span></label>
                            <select name='language' required>
                                <option value='' disabled selected>Select language</option>
                                {
                                    languages.map(language => (
                                        <option value={language.language_id}>{language.language_name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className='form-group'>
                            <label>Genre</label>

                            <select id='genre-select'>
                                <option value='' disabled selected>Select genre</option>
                                {
                                    genres.map(genre => (
                                        <option value={genre.genre_id}>{genre.genre_name}</option>
                                    ))
                                }
                            </select>

                            <div id='selected-genres' className='selected-items'></div>

                            <input type='hidden' name='genres' id='genres-input' />
                        </div>

                        <div className='form-group'>
                            <label>Mood</label>

                            <select id='mood-select'>
                                <option value='' disabled selected>Select mood</option>
                                {
                                    moods.map(mood => (
                                        <option value={mood.mood_id}>{mood.mood_name}</option>
                                    ))
                                }
                            </select>

                            <div id='selected-moods' className='selected-items'></div>

                            <input type='hidden' name='moods' id='moods-input' />
                        </div>

                        <div className='form-group'>
                            <label>Instrument</label>

                            <select id='instrument-select'>
                                <option value='' disabled selected>Select instrument</option>
                                {
                                    instruments.map(instrument => (
                                        <option value={instrument.instrument_id}>{instrument.instrument_name}</option>
                                    ))
                                }
                            </select>

                            <div id='selected-instruments' className='selected-items'></div>

                            <input type='hidden' name='instruments' id='instruments-input' />
                        </div>

                        <div className="form-group">
                            <label>Release Date<span style={{ color: "red" }}>*</span></label>
                            <DatePicker ref={datePickerRef} name="release_date" required />
                        </div>

                        <div className="form-group">
                            <label>Song audio<span style={{ color: "red" }}>*</span></label>
                            <label className="file-input-wrapper">
                                <span className="file-btn">+</span>
                                <span className="file-name" id="song-file-name">No file chosen</span>
                                <input
                                    type="file"
                                    name="song_audio"
                                    accept=".mp3, .wav"
                                    required
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
                                <input
                                    type="file"
                                    name="lyrics"
                                    accept=".txt"
                                    onChange={e => {
                                        const el = document.getElementById("lyrics-file-name");
                                        if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                    }}
                                />
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Copyright Certificate<span style={{ color: "red" }}>*</span></label>
                            <label className="file-input-wrapper">
                                <span className="file-btn">+</span>
                                <span className="file-name" id="cc-file-name">No file chosen</span>
                                <input
                                    type="file"
                                    name="copyright_certificate"
                                    accept=".pdf"
                                    required
                                    onChange={e => {
                                        const el = document.getElementById("cc-file-name");
                                        if (el) el.textContent = e.target.files?.[0]?.name ?? "No file chosen";
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div id='upload-song-form-bottom'>
                    <button type='submit' style={{ opacity: uploading ? 0.4 : 1, pointerEvents: uploading ? "none" : "auto" }}>
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>

            </form>
        </div>
    );
}