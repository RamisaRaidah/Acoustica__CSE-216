import "@/components/music_player/MusicPlayer.css";
import { useMusic } from "@/contexts/MusicContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { addStreamHistory } from "@/services/user_service/users";
import { SongInfo, getSongMetadata, likeSong } from "@/services/music_service/songs";
import play_previous_button from '@/assets/images/Musicbar_Buttons/Play_Previous_Button.png';
import play_button from '@/assets/images/Musicbar_Buttons/Play_Button.png';
import pause_button from '@/assets/images/Musicbar_Buttons/Pause_Button.png';
import play_next_button from '@/assets/images/Musicbar_Buttons/Play_Next_Button.png';
import lyrics_button from '@/assets/images/Musicbar_Buttons/Lyrics_Button.png';
import like_button from '@/assets/images/Musicbar_Buttons/Like_Button.png';
import shuffle_button from '@/assets/images/Musicbar_Buttons/Shuffle_Button.png';
import queue_button from '@/assets/images/Musicbar_Buttons/Queue_Button.png';
import full_screen_button from '@/assets/images/Musicbar_Buttons/Full_Screen_Button.png';
import { useNavigate } from "react-router-dom";

export default function MusicPlayer() {
    const { song, song_play_status, song_url, cover_picture_url, play_key, playSong, liked, toggleLike, prev, next, queue, createQueue, shuffleQueue, playAtIndex } = useMusic();

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(song_play_status?.playing ?? false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progressWidth, setProgressWidth] = useState("0%");
    const [ready, setReady] = useState(false);
    const [songReady, setSongReady] = useState(false);
    const [coverPictureReady, setCoverPictureReady] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const navigate = useNavigate();

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ":" + (secs < 10 ? "0" : "") + secs;
    };

    const formatSongLength = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const savePlayerState = useCallback((data: object) => {
        localStorage.setItem("song", JSON.stringify(data));
    }, [song?.song_id, play_key]);

    const startSegment = useCallback(() => {
        if (startTimeRef.current === null && audioRef.current) {
            startTimeRef.current = audioRef.current.currentTime;
        }
    }, [song?.song_id, play_key]);

    const flushSegments = useCallback(() => {
        const segments = JSON.parse(localStorage.getItem('stream_segments') || '[]');
        if (segments.length === 0) return;
        addStreamHistory(segments);
        localStorage.removeItem('stream_segments');
    }, [song?.song_id, play_key]);

    const endSegment = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || startTimeRef.current === null) return;

        const endTime = audio.currentTime;
        const duration = endTime - startTimeRef.current;
        const progress = (audio.currentTime / audio.duration) * 100;

        if (duration > 5) {
            const segments = JSON.parse(localStorage.getItem('stream_segments') || '[]');
            segments.push({
                song_id: song?.song_id,
                datetime: new Date().toISOString(),
                duration,
                progress
            });
            localStorage.setItem('stream_segments', JSON.stringify(segments));
            if (segments.length >= 5) flushSegments();
        }
        startTimeRef.current = null;
    }, [song?.song_id, play_key, flushSegments]);

    useEffect(() => {
        const handleUnload = () => {
            endSegment();
            flushSegments();
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [song?.song_id, play_key, endSegment, flushSegments]);

    useEffect(() => {
        setReady(false);
        setCurrentTime(0);
        setDuration(0);
        setProgressWidth("0%");
        setIsPlaying(false);
        startTimeRef.current = null;
    }, [song?.song_id, play_key]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            if (!Number.isFinite(audio.duration)) return;

            const initialProgress = song_play_status?.progress ?? 0;
            audio.currentTime = audio.duration * (initialProgress / 100);
            startTimeRef.current = audio.currentTime;

            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            setProgressWidth(((audio.currentTime / audio.duration) * 100) + "%");
            setSongReady(true);

            if (song_play_status?.playing) {
                audio.play();
                setIsPlaying(true);
                startSegment();
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, [song?.song_id, play_key, song_play_status?.progress, song_play_status?.playing, startSegment]);

    useEffect(() => {
        if (cover_picture_url) setCoverPictureReady(true);
    }, [song?.song_id, play_key, cover_picture_url]);

    useEffect(() => {
        if (songReady && coverPictureReady) setReady(true);
    }, [song?.song_id, play_key, songReady, coverPictureReady]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!Number.isFinite(audio.duration)) return;
            setCurrentTime(audio.currentTime);
            setProgressWidth(((audio.currentTime / audio.duration) * 100) + "%");
            savePlayerState({
                song_id: song?.song_id,
                progress: (audio.currentTime / audio.duration) * 100,
                playing: isPlaying
            });
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, [song?.song_id, play_key, isPlaying, savePlayerState]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleEnded = () => {
            setIsPlaying(false);
            endSegment();
            next();
        };
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [endSegment, next]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio || !ready) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            endSegment();
        } else {
            audio.play();
            setIsPlaying(true);
            startSegment();
        }

        savePlayerState({
            song_id: song?.song_id,
            progress: (audio.currentTime / audio.duration) * 100,
            playing: !isPlaying
        });
    };

    const updateTimeFromDrag = useCallback((e: MouseEvent | React.MouseEvent) => {
        const audio = audioRef.current;
        const progressContainer = progressContainerRef.current;
        if (!audio || !progressContainer || !Number.isFinite(audio.duration)) return;

        endSegment();
        const rect = progressContainer.getBoundingClientRect();
        let offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        audio.currentTime = (offsetX / rect.width) * audio.duration;
        setProgressWidth(((audio.currentTime / audio.duration) * 100) + "%");
        setCurrentTime(audio.currentTime);

        audio.play().then(() => {
            setIsPlaying(true);
            startSegment();
        });
    }, [endSegment, startSegment]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        updateTimeFromDrag(e);

        const onMouseMove = (event: MouseEvent) => updateTimeFromDrag(event);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [updateTimeFromDrag]);

    useEffect(() => {
        createQueue([1, 3, 6, 7, 8, 9]);
    }, []);

    return (
        <div className="music_player">
            <audio ref={audioRef} src={song_url ?? ""} className="audio" />

            <img
                src={cover_picture_url ?? ""}
                className="cover_picture"
                style={{ display: ready ? "block" : "none" }}
            />

            <div className="song_info">
                <div id="song-name" onClick={() => navigate(`/music/songs/${song?.song_id}`)}>{ready ? song?.title : ""}</div>
                <div id="artist-name" onClick={() => navigate(`/artists/${song?.owner_id}`)}>{ready ? song?.owner_name : ""}</div>
            </div>

            <div className="music_control1">
                <div className="music_control1_top" style={{ opacity: ready ? 1 : 0.4, pointerEvents: ready ? 'auto' : 'none' }}>
                    <img src={play_previous_button} className="play_previous_button" onClick={prev} />
                    <img
                        src={isPlaying ? pause_button : play_button}
                        className="play_pause_button"
                        onClick={handlePlayPause}
                    />
                    <img src={play_next_button} className="play_next_button" onClick={next} />
                </div>

                <div className="music_control1_bottom">
                    <p className="play_time">{song_url ? formatTime(currentTime) : "..."}</p>
                    <div
                        className="progress_container"
                        ref={progressContainerRef}
                        onClick={updateTimeFromDrag as any}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="progress_track">
                            <div className="progress_bar" ref={progressBarRef} style={{ width: progressWidth }}>
                                <div className="progress_knob"></div>
                            </div>
                        </div>
                    </div>
                    <p className="total_time">{song_url ? formatTime(duration) : "..."}</p>
                </div>
            </div>

            <div className="music_control2" style={{ opacity: ready ? 1 : 0.4, pointerEvents: ready ? 'auto' : 'none' }}>
                <img src={lyrics_button} className="lyrics_button" />
                <img
                    src={like_button}
                    className="like_button"
                    onClick={() => { if (song) { toggleLike(); likeSong(song.song_id); } }}
                    style={{ filter: liked ? 'invert(1) sepia(1) saturate(5) hue-rotate(300deg)' : "none" }}
                />
                <img
                    src={queue_button}
                    className={`queue_button${queueOpen ? ' queue_button--active' : ''}`}
                    onClick={() => setQueueOpen(prev => !prev)}
                />
                <img src={shuffle_button} className="shuffle_button" onClick={shuffleQueue} />
                <img src={full_screen_button} className="full_screen_button" />
            </div>

            {/* Queue Popup */}
            <div className={`queue_popup${queueOpen ? ' queue_popup--open' : ''}`}>
                <div className="queue_popup_header">
                    <span className="queue_popup_title">Up next</span>
                    <div className="queue_popup_header_right">
                        <span className="queue_popup_count">{queue.length} songs</span>
                        <button className="queue_popup_close" onClick={() => setQueueOpen(false)}>✕</button>
                    </div>
                </div>
                <div className="queue_popup_divider" />
                <div className="queue_popup_list">
                    {queue.length === 0 ? (
                        <div className="queue_empty">Your queue is empty</div>
                    ) : queue.map((qSong, index) => (
                        <div
                            className="queue_item"
                            key={qSong.song_id}
                            onClick={() => {
                                playAtIndex(index);
                                setQueueOpen(false);
                            }}
                        >
                            <div className="queue_item_index">{index + 1}</div>
                            <div className="queue_item_info">
                                <div className="queue_item_title">{qSong.title}</div>
                                <div className="queue_item_artist">{qSong.owner_name}</div>
                            </div>
                            <div className="queue_item_duration">{formatSongLength(qSong.length)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}