import { createContext, useState, useContext, useEffect } from "react";
import { SongInfo, getSongMetadata, getSongAudio, isLiked } from "@/services/music_service/songs";
import { getAlbumCoverPicture } from "@/services/music_service/albums";
import { getLastListening } from "@/services/user_service/users";
import { getRecommendedSongs } from "@/services/analytics_service/analytics";
import { shuffle, isSubset } from "@/utils/helper";

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
    createQueue: (songs: number[], autoPlay?: boolean, initialProgress?: number) => void;
    addToQueue: (song: number, atStart: boolean) => void;
    removeFromQueue: (song: number) => void;
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
    const [playedSongs, setPlayedSongs] = useState<number[]>([]);
    const [index, setIndex] = useState<number>(0);
    const [initialized, setInitialized] = useState<boolean>(false);

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
        async function loadRecommendedSongs() {
            if (!song_play_status) return;
            const recommendedSongs = await getRecommendedSongs();
            const newQueue = shuffle(recommendedSongs.filter(x => !queue.some(y => x.song_id === y.song_id))).slice(0, 15);
            setQueue(newQueue);
            setIndex(0);
            setPlayedSongs([]);
            if (newQueue.length > 0) {
                playSong({ song_id: newQueue[0].song_id, progress: 0, playing: true });
            }
        }

        const justPlayed = queue[index].song_id;
        const updatedPlayed = new Set([...playedSongs, justPlayed]);

        if (queue.length > 0 && isSubset(new Set(queue.map(x => x.song_id)), updatedPlayed)) {
            loadRecommendedSongs();
        } 
        else {
            const newIndex = index < queue.length - 1 ? index + 1 : 0;
            setIndex(newIndex);
            playSong({ song_id: queue[newIndex].song_id, progress: 0, playing: true });
            setPlayedSongs([...playedSongs, justPlayed]);
        }
    }

    async function createQueue(songs: number[], autoPlay = true, initialProgress = 0) {
        const results = await Promise.all(songs.map(id => getSongMetadata(id)));
        setQueue(results);
        setIndex(0);
        if (results.length > 0) {
            playSong({ song_id: results[0].song_id, progress: initialProgress, playing: autoPlay });
        }
    }

    async function addToQueue(song: number, atStart = false) {
        const result = await getSongMetadata(song);
        if (atStart) {
            setQueue(queue.filter(x => x.song_id !== song));
            setQueue([result, ...queue]);
        }
        else {
            if (queue.some(x => x.song_id === song)) return;
            else setQueue([...queue, result]);
        }
    }

    function removeFromQueue(song: number) {
        setQueue(queue.filter(x => x.song_id != song));
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
        async function init() {
            if (song_play_status) {
                setSongPlayStatus({ ...song_play_status, playing: false });
                localStorage.setItem("song", JSON.stringify({ ...song_play_status, playing: false }));
            } else {
                const res = await getLastListening();
                if (res.song_id !== -1) {
                    const lastSong: SongPlayStatus = {
                        song_id: res.song_id,
                        progress: res.progress,
                        playing: false
                    };
                    setSongPlayStatus(lastSong);
                    localStorage.setItem("song", JSON.stringify(lastSong));
                }
            }
            setInitialized(true);
            setLoading(false);
        }
        init();
    }, []);

    useEffect(() => {
        if (!initialized || !song_play_status) return;

        async function loadRecommendedSongs() {
            if (!song_play_status) return;
            const [recommendedSongs, currentSong] = await Promise.all([
                getRecommendedSongs(),
                getSongMetadata(song_play_status.song_id)
            ]);
            setQueue([currentSong, ...shuffle(recommendedSongs.filter(x => x.song_id !== currentSong.song_id)).slice(0, 14)]);
        }

        if (queue.length === 0) {
            loadRecommendedSongs();
            playSong(song_play_status);
        }
    }, [initialized, song_play_status?.song_id]);

    return (
        <MusicContext.Provider value={{ song, song_play_status, playSong, song_url, cover_picture_url, play_key, liked, toggleLike, queue, prev, next, createQueue, addToQueue, removeFromQueue, shuffleQueue, playAtIndex, loading }}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const musicContext = useContext(MusicContext);
    if (!musicContext) throw new Error("useMusic must be used inside MusicProvider");
    return musicContext;
}