import "@/components/music_player/MusicPlayer.css";
import { useMusic } from "@/contexts/MusicContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { addStreamHistory } from "@/services/user_service/listeners";
import { likeSong, getSongLyrics } from "@/services/music_service/songs";
import play_previous_button from '@/assets/images/Musicbar_Buttons/Play_Previous_Button.png';
import play_button from '@/assets/images/Musicbar_Buttons/Play_Button.png';
import pause_button from '@/assets/images/Musicbar_Buttons/Pause_Button.png';
import play_next_button from '@/assets/images/Musicbar_Buttons/Play_Next_Button.png';
import lyrics_button from '@/assets/images/Musicbar_Buttons/Lyrics_Button.png';
import like_button from '@/assets/images/Musicbar_Buttons/Like_Button.png';
import shuffle_button from '@/assets/images/Musicbar_Buttons/Shuffle_Button.png';
import queue_button from '@/assets/images/Musicbar_Buttons/Queue_Button.png';
import loop_button from '@/assets/images/Musicbar_Buttons/Loop_Button.png';
import full_screen_button from '@/assets/images/Musicbar_Buttons/Full_Screen_Button.png';
import exit_full_screen_button from '@/assets/images/Musicbar_Buttons/Exit_Full_Screen_Button.png';
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import SongProfile from '@/pages/music/song/song_profile/SongProfile';

export default function MusicPlayer() {
    const { song, song_play_status, play, pause, song_url, cover_picture_url, play_key, liked, toggleLike, prev, next, queue, removeFromQueue, shuffleQueue, playAtIndex, loop, toggleLoop, limitReached } = useMusic();

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number | null>(null);

    const [isFullScreen, setFullScreen] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progressWidth, setProgressWidth] = useState("0%");
    const [ready, setReady] = useState(false);
    const [songReady, setSongReady] = useState(false);
    const [coverPictureReady, setCoverPictureReady] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [lyricsOpen, setLyricsOpen] = useState(false);
    const [lyricsText, setLyricsText] = useState<string>("");
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const limitReachedRef = useRef(limitReached);
    const navigate = useNavigate();

    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

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
                playing: song_play_status?.playing
            });
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, [song?.song_id, play_key, song_play_status?.playing, savePlayerState]);

    useEffect(() => {
        limitReachedRef.current = limitReached;
    }, [limitReached]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleEnded = () => {
            pause();
            endSegment();
            flushSegments();
            next();
        };
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [endSegment, next]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio || !ready) return;

        if (song_play_status?.playing) {
            audio.pause();
            pause();
            endSegment();
        } 
        else {
            audio.play();
            play();
            startSegment();
        }
        savePlayerState({
            song_id: song?.song_id,
            progress: (audio.currentTime / audio.duration) * 100,
            playing: !song_play_status?.playing
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setFullScreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
            play();
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
        <div id="music-player-container">
            <div id="fullscreen-overlay" style={{ display: isFullScreen ? 'flex' : 'none' }}>
                <div id="overlay-left">
                    <div id="cd-container" className={song_play_status?.playing ? 'cd-spinning' : ''}>
                        <div id="cd-disc">
                            <img src={cover_picture_url ?? ''} id="cd-cover-img" />
                            <div id="cd-hole"></div>
                        </div>
                    </div>
                </div>
                <div id="overlay-right">
                    <div id="overlay-song-name">{song?.title}</div>
                    <div id="overlay-album-name">{song?.album_title}</div>
                    <div id="overlay-artist-name">{song?.owner_name}</div>
                </div>
            </div>

            <div id="music-player" style={{ left: isFullScreen ? '0vw' : '18vw', width: isFullScreen ? '100%' : '82vw' }}>
                <audio ref={audioRef} src={song_url ?? ""} className="audio" />

                <img
                    src={cover_picture_url ?? ""}
                    className="cover_picture"
                    style={{ display: ready ? "block" : "none" }}
                />

                <div className="song_info">
                    <div id="song-name" onClick={() => { setFullScreen(false); 
                        if (song?.song_id !== undefined) {
                            setSelectedSongId(song.song_id);
                        }}}
                    >
                    {ready ? song?.title : ""}
                    </div>
                    <div id="artist-name" onClick={() => { setFullScreen(false); navigate(`/artists/${song?.owner_id}`); }}>{ready ? song?.owner_name : ""}</div>
                </div>

                <div className="music_control1">
                    <div className="music_control1_top" style={{ opacity: ready ? 1 : 0.4, pointerEvents: ready ? 'auto' : 'none' }}>
                        <img src={play_previous_button} className="play_previous_button" onClick={() => {
                            endSegment();
                            flushSegments();
                            prev();
                        }} />
                        <img
                            src={song_play_status?.playing ? pause_button : play_button}
                            className="play_pause_button"
                            onClick={handlePlayPause}
                        />
                        <img src={play_next_button} className="play_next_button" onClick={() => {
                            endSegment();
                            flushSegments();
                            next();
                        }} />
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
                    <img
                        src={lyrics_button}
                        className={`lyrics_button${lyricsOpen ? ' lyrics_button--active' : ''}`}
                        onClick={async () => {
                            if (lyricsOpen) { setLyricsOpen(false); return; }
                            if (!song) return;
                            setLyricsOpen(true);
                            setLyricsLoading(true);
                            try {
                                const res = await getSongLyrics(song.song_id);
                                console.log(res);

                                if (!res.lyrics || res.lyrics === "null") {
                                    setLyricsText("No lyrics available for this song.");
                                    setLyricsLoading(false);
                                    return;
                                }

                                const textRes = await fetch(res.lyrics);
                                console.log(textRes);
                                const text = await textRes.text();
                                console.log(text);
                                setLyricsText(text);
                            } catch {
                                setLyricsText("No lyrics available for this song");
                            } finally {
                                setLyricsLoading(false);
                            }
                        }}
                    />
                    <img
                        src={like_button}
                        className="like_button"
                        onClick={() => { if (song) { toggleLike(); likeSong(song.song_id); } }}
                        style={{ filter: liked ? 'brightness(0) saturate(100%) invert(12%) sepia(60%) saturate(800%) hue-rotate(340deg) brightness(90%)' : undefined }}
                    />
                    <img
                        src={queue_button}
                        className={`queue_button${queueOpen ? ' queue_button--active' : ''}`}
                        onClick={() => setQueueOpen(prev => !prev)}
                    />
                    <img src={shuffle_button} className="shuffle_button" onClick={shuffleQueue} />
                    <img src={loop_button} className="loop_button" onClick={toggleLoop} style={{ filter: loop ? 'brightness(0) saturate(100%) invert(12%) sepia(60%) saturate(800%) hue-rotate(340deg) brightness(90%)' : undefined }} />
                    <img src={isFullScreen ? exit_full_screen_button : full_screen_button} className="full_screen_button" onClick={() => setFullScreen(!isFullScreen)} />
                </div>

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
                        ) : (
                            <>
                                {song && (
                                    <>
                                        <div className="queue_section_header">Now playing</div>
                                        <div className="queue_item queue_now_playing">
                                            <div className="queue_item_index">▶</div>
                                            <div className="queue_item_info">
                                                <div className="queue_item_title">{song.title}</div>
                                                <div className="queue_item_artist">{song.owner_name}</div>
                                            </div>
                                            <div className="queue_item_duration">{formatTime(duration)}</div>
                                            <button className="queue_item_remove" style={{ visibility: 'hidden' }} disabled>✕</button>
                                        </div>
                                    </>
                                )}
                                <div className="queue_section_header">Queue</div>
                                    {queue.map((qSong, i) => {
                                        const isCurrentSong = qSong.song_id === song_play_status?.song_id;
                                        return (
                                            <div
                                                className={`queue_item${isCurrentSong ? ' queue_item--playing' : ''}`}
                                                key={qSong.song_id}
                                                onClick={() => playAtIndex(i)}
                                            >
                                                <div className="queue_item_index">
                                                    {isCurrentSong ? '▶' : i + 1}
                                                </div>
                                                <div className="queue_item_info">
                                                    <div className="queue_item_title">{qSong.title}</div>
                                                    <div className="queue_item_artist">{qSong.owner_name}</div>
                                                </div>
                                                <div className="queue_item_duration">{formatSongLength(qSong.length)}</div>
                                                <button
                                                    className="queue_item_remove"
                                                    onClick={e => { e.stopPropagation(); removeFromQueue(qSong.song_id); }}
                                                    title="Remove from queue"
                                                    disabled={isCurrentSong}
                                                    style={{ visibility: isCurrentSong ? 'hidden' : undefined }}
                                                >✕</button>
                                            </div>
                                        );
                                    })}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {lyricsOpen && createPortal(
                <div className="lyrics_overlay" onClick={() => setLyricsOpen(false)}>
                    <div className="lyrics_popup" onClick={e => e.stopPropagation()}>
                        <div className="lyrics_header">
                            <div className="lyrics_header_left">
                                <div className="lyrics_song_name">{song?.title}</div>
                                <div className="lyrics_artist_name">{song?.owner_name}</div>
                            </div>
                            <button className="lyrics_close" onClick={() => setLyricsOpen(false)}>✕</button>
                        </div>
                        <div className="lyrics_body">
                            {lyricsLoading ? (
                                <div className="lyrics_loading">
                                    <div className="lyrics_loading_dot" />
                                    <div className="lyrics_loading_dot" />
                                    <div className="lyrics_loading_dot" />
                                </div>
                            ) : (
                                <pre className="lyrics_text">{lyricsText}</pre>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

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