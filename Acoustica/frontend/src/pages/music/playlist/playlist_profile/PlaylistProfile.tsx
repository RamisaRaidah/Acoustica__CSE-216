import '@/pages/music/playlist/playlist_profile/PlaylistProfile.css'
import default_cover from '@/assets/images/deco/Default_Cover_Picture.png';
import { useEffect, useState } from 'react';
import { getPlaylistDatails, GetPlaylistDatailsResponse, getPlaylistSongs, GetPlaylistSongsResponse } from '@/services/music_service/playlists';
import { useParams } from 'react-router-dom';

export default function PlaylistProfile() {
    const { playlist_id } = useParams<{playlist_id: string}>();
    const playlistId = Number(playlist_id);
    const [title, setTitle] = useState<string>('');
    const [cover_picture, setCoverPicture] = useState<string>('');
    const [privacy, setPrivacy] = useState<string>('');
    const [songs, setSongs] = useState<GetPlaylistSongsResponse[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const [view_count, setViewCount] = useState<number>(0);

    useEffect(() => {
        getPlaylistDatails(playlistId).then(info => {
            setTitle(info.title);
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

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);

    return (
        <div id='playlist-profile-container'>
            <div id="playlist-card">

                <div id="playlist-card-top">
                    <div id="card-cover-picture">
                        <img src={cover_picture || default_cover} alt="Playlist cover" />
                    </div>

                    <div id="card-info">
                        <p id="playlist-label">Playlist</p>
                        <h2 id="playlist-title">{title || "Untitled"}</h2>
                        <div id="playlist-meta">
                            <span>{privacy || "private"}</span>
                            <span>•</span>
                            <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
                            <span>•</span>
                            <span>
                                {hrs > 0 && `${hrs} hr `}
                                {mins} min
                            </span>
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

                    <button id="edit-playlist-btn">
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
    );
}