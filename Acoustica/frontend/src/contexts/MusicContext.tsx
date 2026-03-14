import { createContext, useState, useContext, useEffect } from "react";
import { getSongAudio } from "@/services/song";
import { getAlbumCoverPicture } from "@/services/album";

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
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider ({ children }: { children: React.ReactNode}) {
    const [song, setSong] = useState<Song | null>(
        JSON.parse(localStorage.getItem("song") || "null")
    );
    const [song_url, setSongURL] = useState<string | null>(null);
    const [cover_picture_url, setCoverPictureURL] = useState<string | null>(null);

    function playSong(song: Song) {
        setSong(song);
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
    }, [song]);

    return (
        <MusicContext.Provider value={{ song, playSong, song_url, cover_picture_url }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const musicContext = useContext(MusicContext);
    if (!musicContext) throw new Error("useMusic must be used inside MusicProvider");
    return musicContext;
}