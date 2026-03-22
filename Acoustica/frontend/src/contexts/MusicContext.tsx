import { createContext, useState, useContext, useEffect } from "react";
import { getSongAudio, isLiked } from "@/services/music_service/songs";
import { getAlbumCoverPicture } from "@/services/music_service/albums";
import { getLastListening } from "@/services/user_service/users";

export interface Song {
    song_id: number;
    album_id: number;
    title: string;
    artist_id: number;
    artist_name: string;
    progress: number;
    playing: boolean;
}

interface MusicContextType {
    song: Song | null;
    playSong: (song: Song) => void;
    song_url: string | null;
    cover_picture_url: string | null;
    play_key: number;
    liked: boolean;
    toggleLike: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [song, setSong] = useState<Song | null>(
        JSON.parse(localStorage.getItem("song") || "null")
    );
    const [song_url, setSongURL] = useState<string | null>(null);
    const [cover_picture_url, setCoverPictureURL] = useState<string | null>(null);
    const [play_key, setPlayKey] = useState(0);
    const [liked, setLiked] = useState<boolean>(false);

    function playSong(song: Song) {
        setSong(song);
        setPlayKey(prev => prev + 1);
        localStorage.setItem("song", JSON.stringify(song));
    }

    function toggleLike() {
        setLiked(!liked);
    }

    useEffect(() => {
        if (!song?.song_id) return;
        getSongAudio(song.song_id).then(res => setSongURL(res.stream_url));
        getAlbumCoverPicture(song.album_id).then(res => setCoverPictureURL(res.cover_picture_url));
        isLiked(song.song_id).then(setLiked);
    }, [song?.song_id, play_key]);

    useEffect(() => {
        if (song) {
            setSong({ ...song, playing: false });
            localStorage.setItem("song", JSON.stringify({ ...song, playing: false }));
        } 
        else {
            getLastListening().then(res => {
                if (res.song_id === -1) return;
                const lastSong: Song = {
                    song_id: res.song_id,
                    album_id: res.album_id,
                    title: res.title,
                    artist_id: res.artist_id,
                    artist_name: res.artist_name,
                    progress: res.progress,
                    playing: false
                };
                setSong(lastSong);
                localStorage.setItem("song", JSON.stringify(lastSong));
            });
        }
    }, []);


    return (
        <MusicContext.Provider value={{ song, playSong, song_url, cover_picture_url, play_key, liked, toggleLike }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const musicContext = useContext(MusicContext);
    if (!musicContext) throw new Error("useMusic must be used inside MusicProvider");
    return musicContext;
}