import api from "@/services/api";
import { useEffect, useRef, useState } from "react";
import { SongInfo } from "@/services/music_service/songs";
import { useNavigate } from "react-router-dom";
import { useMusic } from "@/contexts/MusicContext";
import SongProfile from "@/pages/music/song/song_profile/SongProfile";
import { useAuth } from "@/contexts/AuthContext";

interface SearchbarProps {
    prompt: string;
    song?: boolean;
    album?: boolean;
    artist?: boolean;
    playlist?: boolean;
    onSongSelect?: (song: SongInfo) => void;
    onAlbumSelect?: (album: AlbumSearchParam) => void;
    onArtistSelect?: (artist: ArtistSearchParam) => void;
    onPlaylistSelect?: (playlist: PlaylistSearchParam) => void;
    prevent_default?: boolean;
}

interface AlbumSearchParam {
    album_id: number;
    title: string;
    owner_id: number;
    owner_name: string;
    asset_id: number;
}

interface ArtistSearchParam {
    artist_id: number;
    artist_name: string;
    asset_id: number;
}

interface PlaylistSearchParam {
    playlist_id: number;
    title: string;
    creator_id: number;
    creator_name: string;
    asset_id: number;
}

export default function Searchbar({ prompt, song = false, album = false, artist = false, playlist = false, onSongSelect, onAlbumSelect, onArtistSelect, onPlaylistSelect, prevent_default = false }: SearchbarProps) {
    const { user } = useAuth();
    const [queryParam, setQueryParam] = useState<string>("");
    const [songs, setSongs] = useState<SongInfo[]>([]);
    const [albums, setAlbums] = useState<AlbumSearchParam[]>([]);
    const [artists, setArtists] = useState<ArtistSearchParam[]>([]);
    const [playlists, setPlaylists] = useState<PlaylistSearchParam[]>([]);
 
    const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
    const seachWrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { playSong, addToQueue } = useMusic();

    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

    useEffect(() => {
        if (!queryParam) {
            setSongs([]);
            setAlbums([]);
            setArtists([]);
            setPlaylists([]);
            setSearchDropdownOpen(false);
            return;
        }

        const debounceTimer = setTimeout(() => {
            if (song) {
                api.request(`/api/search/song?q=${encodeURIComponent(queryParam)}`).then((data) => {
                    setSongs(data.songs);
                    if (data.songs.length > 0) setSearchDropdownOpen(true);
                });
            }
            if (album) {
                api.request(`/api/search/album?q=${encodeURIComponent(queryParam)}`).then((data) => {
                    setAlbums(data.albums);
                    if (data.albums.length > 0) setSearchDropdownOpen(true);
                });
            }
            if (artist) {
                api.request(`/api/search/artist?q=${encodeURIComponent(queryParam)}`).then((data) => {
                    setArtists(data.artists);
                    if (data.artists.length > 0) setSearchDropdownOpen(true);
                });
            }
            if (playlist) {
                api.request(`/api/search/playlist?q=${encodeURIComponent(queryParam)}`).then((data) => {
                    setPlaylists(data.playlists);  
                    if (data.playlists.length > 0) setSearchDropdownOpen(true);
                });
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [queryParam]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!seachWrapperRef.current?.contains(e.target as Node)) {
                setSearchDropdownOpen(false);
                setQueryParam('');
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    const close = () => {
        setSearchDropdownOpen(false);
        setQueryParam('');
    };

    return (
        <div className="searchbar">
            <div ref={seachWrapperRef} className="search_wrapper">
                <input
                    type="text"
                    placeholder={prompt}
                    className="search_bar"
                    value={queryParam}
                    onChange={(e) => {
                        setQueryParam(e.target.value.trim());
                    }}
                />
                <div className={`search_dropdown ${searchDropdownOpen ? "active" : ""}`}>

                    {songs.length > 0 && (
                        <div className="song_result">
                            <div className="song_result_header">Songs</div>
                            {songs.map((song) => (
                                <div
                                    className="search_item search_item_song"
                                    key={song.song_id}
                                    onClick={() => {
                                        close();
                                        onSongSelect?.(song);
                                        if (!prevent_default){
                                            if (song?.song_id !== undefined) {
                                                setSelectedSongId(song.song_id);
                                            }
                                        }
                                    }}
                                >
                                    {user?.user_type === "listener" && !prevent_default && (
                                        <div
                                            className="play_button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToQueue(song.song_id, true);
                                                playSong({ song_id: song.song_id, progress: 0, playing: true });
                                                close();
                                            }}
                                        >
                                            ▶
                                        </div>
                                    )}
                                    <div className="search_item_text">
                                        <span
                                            className="search_item_title"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    if (song?.song_id !== undefined) {
                                                        setSelectedSongId(song.song_id);
                                                    }
                                                    close();
                                                }
                                            }}
                                        >
                                            {song.title}
                                        </span>
                                        <span
                                            className="search_item_artist_name"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    navigate(`/artists/${song.owner_id}`);
                                                    close();
                                                }
                                            }}
                                        >
                                            {song.owner_name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {albums.length > 0 && (
                        <div className="album_result">
                            <div className="album_result_header">Albums</div>
                            {albums.map((album) => (
                                <div
                                    className="search_item"
                                    key={album.album_id}
                                    onClick={() => {
                                        close();
                                        onAlbumSelect?.(album);
                                        if (!prevent_default) navigate(`/music/albums/${album.album_id}`);
                                    }}
                                >
                                    <div className="search_item_text">
                                        <span
                                            className="search_item_title"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    navigate(`/music/albums/${album.album_id}`);
                                                    close();
                                                }
                                            }}
                                        >
                                            {album.title}
                                        </span>
                                        <span
                                            className="search_item_artist_name"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    navigate(`/artists/${album.owner_id}`);
                                                    close();
                                                }
                                            }}
                                        >
                                            {album.owner_name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {artists.length > 0 && (
                        <div className="artist_result">
                            <div className="artist_result_header">Artists</div>
                            {artists.map((artist) => (
                                <div
                                    className="search_item"
                                    key={artist.artist_id}
                                    onClick={() => {
                                        close();
                                        onArtistSelect?.(artist);
                                        if (!prevent_default) navigate(`/artists/${artist.artist_id}`);
                                    }}
                                >
                                    <div className="search_item_text">
                                        <span className="search_item_title">{artist.artist_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {playlists.length > 0 && (
                        <div className="playlist_result">
                            <div className="playlist_result_header">Playlists</div>
                            {playlists.map((playlist) => (
                                <div
                                    className="search_item"
                                    key={playlist.playlist_id}
                                    onClick={() => {
                                        close();
                                        onPlaylistSelect?.(playlist);
                                        if (!prevent_default) navigate(`/music/playlists/${playlist.playlist_id}`);
                                    }}
                                >
                                    <div className="search_item_text">
                                        <span
                                            className="search_item_title"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    navigate(`/music/playlists/${playlist.playlist_id}`);
                                                    close();
                                                }
                                            }}
                                        >
                                            {playlist.title}
                                        </span>
                                        <span
                                            className="search_item_artist_name"
                                            onClick={(e) => {
                                                if (!prevent_default) {
                                                    e.stopPropagation();
                                                    navigate(`/artists/${playlist.creator_id}`);
                                                    close();
                                                }
                                            }}
                                        >
                                            {playlist.creator_name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedSongId && (
                <SongProfile
                    isOpen={true}
                    onClose={() => setSelectedSongId(null)}
                    songId={selectedSongId}
                />
            )}
        </div>
    );
}