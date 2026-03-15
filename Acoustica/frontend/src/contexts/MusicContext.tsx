import { createContext, useState, useContext, useEffect } from "react";
import { getSongAudio } from "@/services/music_service/songs";
import { getAlbumCoverPicture } from "@/services/music_service/albums";
import { getLastListening } from "@/services/user_service/users";

interface Song {
    song_id: number;
    album_id: number;
    title: string;
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
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [song, setSong] = useState<Song | null>(
        JSON.parse(localStorage.getItem("song") || "null")
    );
    const [song_url, setSongURL] = useState<string | null>(null);
    const [cover_picture_url, setCoverPictureURL] = useState<string | null>(null);
    const [play_key, setPlayKey] = useState(0);

    function playSong(song: Song) {
        setSong(song);
        setPlayKey(prev => prev + 1);
        localStorage.setItem("song", JSON.stringify(song));
    }

    useEffect(() => {
        if (song) {
            setSong({ ...song, playing: false });
            localStorage.setItem("song", JSON.stringify(song));
        }
    }, []);

    useEffect(() => {
        if (!song?.song_id) return;
        getSongAudio(song.song_id).then(res => setSongURL(res.stream_url));
        getAlbumCoverPicture(song.album_id).then(res => setCoverPictureURL(res.cover_picture_url));
    }, [song?.song_id, play_key]);

    useEffect(() => {
        if (localStorage.getItem("song")) return;
        getLastListening().then(res => localStorage.setItem("song", JSON.stringify({
            "song_id": res.song_id,
            "album_id": res.album_id,
            "title": res.title,
            "artist_name": res.artist_name,
            "progress": res.progress,
            "playing": false
        })))
    }, []);


    return (
        <MusicContext.Provider value={{ song, playSong, song_url, cover_picture_url, play_key }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const musicContext = useContext(MusicContext);
    if (!musicContext) throw new Error("useMusic must be used inside MusicProvider");
    return musicContext;
}