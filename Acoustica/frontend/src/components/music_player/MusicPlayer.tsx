import "@/components/music_player/MusicPlayer.css";
import { useMusic } from "@/contexts/MusicContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { sendStreamHistory } from "@/services/user_service/users";
import play_previous_button from '@/assets/images/Musicbar_Buttons/Play_Previous_Button.png';
import play_button from '@/assets/images/Musicbar_Buttons/Play_Button.png';
import pause_button from '@/assets/images/Musicbar_Buttons/Pause_Button.png';
import play_next_button from '@/assets/images/Musicbar_Buttons/Play_Next_Button.png';
import lyrics_button from '@/assets/images/Musicbar_Buttons/Lyrics_Button.png';
import like_button from '@/assets/images/Musicbar_Buttons/Like_Button.png';
import full_screen_button from '@/assets/images/Musicbar_Buttons/Full_Screen_Button.png';

export function MusicPlayer() {
    const { song, song_url, cover_picture_url, play_key } = useMusic();

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(song?.playing ?? false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progressWidth, setProgressWidth] = useState("0%");
    const [ready, setReady] = useState(false);
    const [songReady, setSongReady] = useState(false);
    const [coverPictureReady, setCoverPictureReady] = useState(false);

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ":" + (secs < 10 ? "0" : "") + secs;
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
        sendStreamHistory(segments);
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

            const initialProgress = song?.progress ?? 0;
            audio.currentTime = audio.duration * (initialProgress / 100);
            startTimeRef.current = audio.currentTime;

            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            setProgressWidth(((audio.currentTime / audio.duration) * 100) + "%");
            setSongReady(true);

            if (song?.playing) {
                audio.play();
                setIsPlaying(true);
                startSegment();
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, [song?.song_id, play_key, song?.progress, song?.playing, startSegment]);

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
                album_id: song?.album_id,
                title: song?.title,
                artist_name: song?.artist_name,
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
        };
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [endSegment]);

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
            album_id: song?.album_id,
            title: song?.title,
            artist_name: song?.artist_name,
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

    return (
        <div className="music_player">
            <audio ref={audioRef} src={song_url ?? ""} className="audio" />

            <img
                src={cover_picture_url ?? ""}
                className="cover_picture"
                style={{ display: ready ? "block" : "none" }}
            />

            <div className="song_info">
                <div className="song_name"><a href="#">{ready ? song?.title : ""}</a></div>
                <div className="artist_name"><a href="#">{ready ? song?.artist_name : ""}</a></div>
            </div>

            <div className="music_control1" >
                <div className="music_control1_top" style={{ opacity: ready ? 1 : 0.4, pointerEvents: ready ? 'auto' : 'none' }}>
                    <img src={play_previous_button} className="play_previous_button" />
                    <img
                        src={isPlaying ? pause_button : play_button}
                        className="play_pause_button"
                        onClick={handlePlayPause}
                    />
                    <img src={play_next_button} className="play_next_button" />
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
                <img src={like_button} className="like_button" />
                <img src={full_screen_button} className="full_screen_button" />
            </div>
        </div>
    );
}