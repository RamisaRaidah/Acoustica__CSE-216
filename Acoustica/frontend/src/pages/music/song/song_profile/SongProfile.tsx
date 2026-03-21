import '@/pages/music/song/song_profile/SongProfile.css';
import { useEffect, useState } from 'react';
import { SongInfo, getSongMetadata, Collaborator, getSongCollaborators, getSongGenres, getSongMoods, getSongInstruments, deleteSong } from '@/services/music_service/songs';
import { Genre, Mood, Instrument } from '@/services/analytics_service/analytics';
import { getAlbumCoverPicture } from '@/services/music_service/albums';
import { getProfilePicture } from '@/services/user_service/users';
import default_pfp from '@/assets/images/Default_pfp.png';
import default_cover_picture from '@/assets/images/music/Default_Cover_Picture.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Alert from '@/components/alert/TwoButtonAlert';
import { useMusic } from '@/contexts/MusicContext';

export default function SongProfile() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { song_id } = useParams<{ song_id: string }>();
    const songId = Number(song_id);
    const [song, setSong] = useState<SongInfo>();
    const [cover_picture, setCoverPicture] = useState<string | null>(null);
    const [owner_profile_picture, setOwnerProfilePicture] = useState<string | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [genres, setGenres] = useState<Genre[]>();
    const [moods, setMoods] = useState<Mood[]>();
    const [instruments, setInstruments] = useState<Instrument[]>();
    const [release_date, setReleaseDate] = useState<string>();
    const [showAllCollaborators, setShowAllCollaborators] = useState<boolean>(false);
    const [collaborator_pfps, setCollaboratorPfps] = useState<Record<number, string>>({});
    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { playSong } = useMusic();

    useEffect(() => {
        async function loadSongData(songId: number) {
            try {
                const [info, collabs, genres, moods, instruments] = await Promise.all([
                    getSongMetadata(songId),
                    getSongCollaborators(songId),
                    getSongGenres(songId),
                    getSongMoods(songId),
                    getSongInstruments(songId),
                ]);

                const [albumCover, ownerPfp, ...collaboratorPfpResults] = await Promise.all([
                    getAlbumCoverPicture(info.album_id),
                    getProfilePicture(info.owner_id),
                    ...collabs.map(c => getProfilePicture(c.artist_id)),
                ]);

                const d = new Date(info.release_date);
                const formattedDate = `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;

                const pfpMap: Record<number, string> = {};
                collabs.forEach((c, i) => {
                    if (collaboratorPfpResults[i].profile_picture !== "null") {
                        pfpMap[c.artist_id] = collaboratorPfpResults[i].profile_picture;
                    }
                });

                setSong(info);
                setCoverPicture(albumCover.cover_picture_url);
                if (ownerPfp.profile_picture !== "null") setOwnerProfilePicture(ownerPfp.profile_picture);
                setReleaseDate(formattedDate);
                setCollaborators(collabs);
                setCollaboratorPfps(pfpMap);
                setGenres(genres);
                setMoods(moods);
                setInstruments(instruments);
            } 
            catch (err) {
                console.log("ERROR:", err);
                setError('Failed to load!');
            } 
            finally {
                setLoading(false);
            }
        }
        loadSongData(songId);
    }, []);

    async function handleDeleteSong() {
        try {
            const response = await deleteSong(songId);
            if (response) {
                setAlertMessage('The song is deleted successfully!');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete the song';
            console.log('ERROR: ', message);
            setAlertMessage('Failed to delete the song');
        }
    }

    const formatLength = (seconds: number) =>
        `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const getCollaboratorsByRole = (role: string) =>
        collaborators.filter(x => x.role.toLowerCase() === role.toLowerCase());

    const vocalists = getCollaboratorsByRole('vocalist');
    const lyricists = getCollaboratorsByRole('lyricist');
    const composers = getCollaboratorsByRole('composer');

    const hasMultiple = vocalists.length > 1 || lyricists.length > 1 || composers.length > 1;

    if (loading) return <div className='loading'>Loading</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='song-profile-container'>
            {alertMessage && <Alert message={alertMessage} onConfirm={() => { setAlertMessage(null); navigate('/music/discography'); }} />}
            {confirmation && <Alert message='Are you sure to delete the song?' type='confirm' onConfirm={() => { setConfirmation(false); handleDeleteSong(); }} onCancel={() => setConfirmation(false)} />}

            <div id='song-profile-container-left'>

                <div id='song-profile-container-left-top'>
                    <div id='song-profile-container-cover-picture-container'>
                        <img
                            src={cover_picture || default_cover_picture}
                            id='song-profile-container-cover-picture'
                            alt='Album cover'
                        />
                    </div>

                    <div id='song-profile-container-song-info'>
                        <div id='song-profile-container-song-title'>{song?.title ?? 'Song Name'}</div>
                        <div id='song-profile-container-owner-name'>{song?.owner_name ?? 'Owner Name'}</div>
                        <div id='song-profile-container-album-title' onClick={() => navigate(`/music/albums/${song?.album_id}`)}>{song?.album_title ?? 'Album Name'}</div>
                        <div id='song-profile-container-length'>
                            {formatLength(song?.length ?? 0)}
                        </div>
                        <div id='song-profile-container-song-buttons'>
                            <button id='song-profile-container-like-btn' title='Like'>❤</button>
                            <button id='song-profile-container-add-btn' title='Add to playlist'>+</button>
                            <button id='song-profile-container-play-btn' title='Play' onClick={() => { if (song) playSong({ song_id: song.song_id, album_id: song.album_id, title: song.title, artist_name: song.owner_name, progress: 0, playing: true }) }}>▶</button>
                        </div>
                    </div>
                </div>

                <div id='song-profile-container-collaborators-card'>
                    <div id='song-profile-container-collaborator-header'>
                        <span>Collaborators</span>
                        {hasMultiple && (
                            <button
                                id='song-profile-container-show-all-btn'
                                onClick={() => setShowAllCollaborators(v => !v)}
                            >
                                {showAllCollaborators ? 'Show Less' : 'Show All'}
                            </button>
                        )}
                    </div>

                    {vocalists.length > 0 && (
                        <div className='song-profile-container-collaborator-group'>
                            <div className='song-profile-container-collaborator-role'>Vocalist</div>
                            {(showAllCollaborators ? vocalists : vocalists.slice(0, 1)).map(c => (
                                <div key={`${c.artist_id}-vocalist`} className='song-profile-container-collaborator-item'>
                                    <img
                                        className='song-profile-container-collaborator-avatar'
                                        src={collaborator_pfps[c.artist_id] || default_pfp}
                                        alt={c.artist_name}
                                    />
                                    <span className='song-profile-container-collaborator-name'>{c.artist_name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {lyricists.length > 0 && (
                        <div className='song-profile-container-collaborator-group'>
                            <div className='song-profile-container-collaborator-role'>Lyricist</div>
                            {(showAllCollaborators ? lyricists : lyricists.slice(0, 1)).map(c => (
                                <div key={`${c.artist_id}-lyricist`} className='song-profile-container-collaborator-item'>
                                    <img
                                        className='song-profile-container-collaborator-avatar'
                                        src={collaborator_pfps[c.artist_id] || default_pfp}
                                        alt={c.artist_name}
                                    />
                                    <span className='song-profile-container-collaborator-name'>{c.artist_name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {composers.length > 0 && (
                        <div className='song-profile-container-collaborator-group'>
                            <div className='song-profile-container-collaborator-role'>Composer</div>
                            {(showAllCollaborators ? composers : composers.slice(0, 1)).map(c => (
                                <div key={`${c.artist_id}-composer`} className='song-profile-container-collaborator-item'>
                                    <img
                                        className='song-profile-container-collaborator-avatar'
                                        src={collaborator_pfps[c.artist_id] || default_pfp}
                                        alt={c.artist_name}
                                    />
                                    <span className='song-profile-container-collaborator-name'>{c.artist_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div id='song-profile-container-right'>

                <div className='song-profile-container-meta-section'>
                    <div className='song-profile-container-meta-header'>Genres</div>
                    <div className='song-profile-container-tag-list'>
                        {genres?.map(x => (
                            <span key={x.genre_name} className='song-profile-container-tag'>{x.genre_name}</span>
                        ))}
                    </div>
                </div>

                <div className='song-profile-container-meta-section'>
                    <div className='song-profile-container-meta-header'>Moods</div>
                    <div className='song-profile-container-tag-list'>
                        {moods?.map(x => (
                            <span key={x.mood_name} className='song-profile-container-tag'>{x.mood_name}</span>
                        ))}
                    </div>
                </div>

                <div className='song-profile-container-meta-section'>
                    <div className='song-profile-container-meta-header'>Instruments</div>
                    <div className='song-profile-container-tag-list'>
                        {instruments?.map(x => (
                            <span key={x.instrument_name} className='song-profile-container-tag'>{x.instrument_name}</span>
                        ))}
                    </div>
                </div>

                <div className='song-profile-container-meta-section'>
                    <div className='song-profile-container-meta-header'>Language</div>
                    <div className='song-profile-container-tag-list'>
                        {song?.language && (
                            <span className='song-profile-container-tag'>{song.language}</span>
                        )}
                    </div>
                </div>

                <div className='song-profile-container-meta-section'>
                    <div className='song-profile-container-meta-header'>Release Date</div>
                    <div id='song-profile-container-release-date'>{release_date}</div>
                </div>

                {user?.user_type === 'artist' && Number(song?.owner_id) === Number(user.user_id) && 
                    <div id='song-profile-container-action-buttons'>
                    <button
                        id='song-profile-container-edit-btn'
                        onClick={() => navigate(`/music/songs/${songId}/edit`)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Song
                    </button>
                        <button id='song-profile-container-delete-btn' onClick={() => setConfirmation(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete Song
                    </button>
                </div>}

            </div>
        </div>
    );
}