import { createContext, useState, useContext, useEffect } from "react";
import { SongInfo, getSongMetadata, getSongAudio, isLiked } from "@/services/music_service/songs";
import { getAlbumCoverPicture } from "@/services/music_service/albums";
import { getLastListening } from "@/services/user_service/users";

export interface SongPlayStatus {
    song_id: number;
    progress: number;
    playing: boolean;
}

interface MusicContextType {
    song: SongInfo | null;
    song_play_status: SongPlayStatus | null;
    playSong: (song: SongPlayStatus) => void;
    song_url: string | null;
    cover_picture_url: string | null;
    play_key: number;
    liked: boolean;
    toggleLike: () => void;
    queue: SongInfo[];
    prev: () => void;
    next: () => void;
    createQueue: (songs: number[]) => void;
    shuffleQueue: () => void;
    playAtIndex: (i: number) => void;
    loading: boolean;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [song_play_status, setSongPlayStatus] = useState<SongPlayStatus | null>(
        JSON.parse(localStorage.getItem("song") || "null")
    );
    const [song, setSong] = useState<SongInfo | null>(null);
    const [song_url, setSongURL] = useState<string | null>(null);
    const [cover_picture_url, setCoverPictureURL] = useState<string | null>(null);
    const [play_key, setPlayKey] = useState(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [queue, setQueue] = useState<SongInfo[]>([]);
    const [index, setIndex] = useState<number>(0);

    function playSong(song_play_status: SongPlayStatus) {
        setSongPlayStatus(song_play_status);
        setPlayKey(prev => prev + 1);
        localStorage.setItem("song", JSON.stringify(song_play_status));
    }

    function toggleLike() {
        setLiked(!liked);
    }

    function prev() {
        const newIndex = index > 0 ? index - 1 : queue.length - 1;
        setIndex(newIndex);
        playSong({ song_id: queue[newIndex].song_id, progress: 0, playing: true });
    }

    function next() {
        const newIndex = index < queue.length - 1 ? index + 1 : 0;
        setIndex(newIndex);
        playSong({ song_id: queue[newIndex].song_id, progress: 0, playing: true });
    }

    async function createQueue(songs: number[], autoPlay = true) {
        const results = await Promise.all(songs.map(id => getSongMetadata(id)));
        setQueue(results);
        setIndex(0);
        if (autoPlay && results.length > 0) {
            playSong({ song_id: results[0].song_id, progress: 0, playing: true });
        }
    }

    function shuffle<T>(array: T[]): T[] {
        const arr = [...array]; 
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function shuffleQueue() {
        const shuffled = shuffle(queue);
        setQueue(shuffled);
        const newIndex = shuffled.findIndex(s => s.song_id === song_play_status?.song_id);
        setIndex(newIndex >= 0 ? newIndex : 0);
    }

    function playAtIndex(i: number) {
        if (i < 0 || i >= queue.length) return;
        setIndex(i);
        playSong({ song_id: queue[i].song_id, progress: 0, playing: true });
    }

    useEffect(() => {
        if (!song_play_status?.song_id) return;
        Promise.all([
            getSongMetadata(song_play_status.song_id).then(song => {
                setSong(song);
                getAlbumCoverPicture(song.album_id).then(res => setCoverPictureURL(res.cover_picture_url));
            })
        ]);
        getSongAudio(song_play_status.song_id).then(res => setSongURL(res.stream_url));
        isLiked(song_play_status.song_id).then(setLiked);
    }, [song_play_status?.song_id, play_key]);

    useEffect(() => {
        if (song_play_status) {
            setSongPlayStatus({ ...song_play_status, playing: false });
            localStorage.setItem("song", JSON.stringify({ ...song_play_status, playing: false }));
        } 
        else {
            getLastListening().then(res => {
                if (res.song_id === -1) return;
                const lastSong: SongPlayStatus = {
                    song_id: res.song_id,
                    progress: res.progress,
                    playing: false
                };
                setSongPlayStatus(lastSong);
                localStorage.setItem("song", JSON.stringify(lastSong));
            });
        }
        setLoading(false);
    }, []);


    return (
        <MusicContext.Provider value={{ song, song_play_status, playSong, song_url, cover_picture_url, play_key, liked, toggleLike, queue, prev, next, createQueue, shuffleQueue, playAtIndex, loading }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const musicContext = useContext(MusicContext);
    if (!musicContext) throw new Error("useMusic must be used inside MusicProvider");
    return musicContext;
}