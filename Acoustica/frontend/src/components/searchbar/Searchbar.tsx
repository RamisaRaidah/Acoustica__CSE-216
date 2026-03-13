import '@/components/searchbar/Searchbar.css'
import api from "@/services/api";
import { useEffect, useRef, useState } from "react";
import { useMusic } from '@/contexts/MusicContext';

interface SearchbarProps {
    song?: boolean;
    album?: boolean;
    artist?: boolean;
}

interface SongType {
    song_id: number;
    album_id: number;
    title: string;
    artist_name: string;
}

interface AlbumType {
    album_id: number;
    title: string;
    artist_name: string;
}

interface ArtistType {
    artist_id: number;
    artist_name: string;
}

export function Searchbar({ song = false, album = false, artist = false} : SearchbarProps) {
    const [queryParam, setQueryParam] = useState<string>("");
    const [songs, setSongs] = useState<SongType[] | null>(null);
    const [albums, setAlbums] = useState<AlbumType[] | null>(null);
    const [artists, setArtists] = useState<ArtistType[] | null>(null);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
    const seachWrapperRef = useRef<HTMLDivElement>(null);
    const { playSong } = useMusic();

    useEffect(() => {
        if (!queryParam) {
            setSongs(null);
            setAlbums(null);
            setArtists(null);
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
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [queryParam]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!seachWrapperRef.current?.contains(e.target as Node)) {
                setSearchDropdownOpen(false);
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="searchbar">
            <div ref={seachWrapperRef} className="search_wrapper">
                <input 
                    type="text" 
                    placeholder="Explore. Discover. Repeat." 
                    className="search_bar" 
                    onChange={(e) => {
                        setQueryParam(e.target.value.trim());
                        console.log(e);
                    }}
                />
                <div className={`search_dropdown ${searchDropdownOpen ? "active" : ""}`}
                >
                    {songs && (
                        <div className="song_result">
                            <div className="song_result_header">Songs</div>
                            {
                                songs.map((song) => (
                                    <div
                                        className="search_item"
                                        key={song.song_id}
                                        data-song-id={song.song_id}
                                        data-album-id={song.album_id}
                                        data-title={song.title}
                                        data-artist_name={song.artist_name}
                                        onClick={() => playSong({song_id: song.song_id, album_id: song.album_id, title: song.title, artist_name:song.artist_name, progress: 0, playing: true})}
                                    >
                                        <span className="search_item_title">{song.title}</span>
                                        <span className="search_item_artist_name">{song.artist_name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {albums && (
                        <div className="album_result">
                            <div className="album_result_header">Albums</div>
                            {
                                albums.map((album) => (
                                    <div
                                        className="search_item"
                                        key={album.album_id}
                                        data-album-id={album.album_id}
                                        data-title={album.title}
                                        data-artist_name={album.artist_name}
                                        onClick={() => alert(album.title)}
                                    >
                                        <span className="search_item_title">{album.title}</span>
                                        <span className="search_item_artist_name">{album.artist_name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {artists && (
                        <div className="artist_result">
                            <div className="artist_result_header">Artists</div>
                            {
                                artists.map((artist) => (
                                    <div
                                        className="search_item"
                                        key={artist.artist_id}
                                        data-artist_id={artist.artist_id}
                                        data-artist_name={artist.artist_name}
                                        onClick={() => alert(artist.artist_name)}
                                    >
                                        <span className="search_item_title">{artist.artist_name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div> 
        </div>
    );
}