import '@/components/topbar/Topbar.css';
import { useEffect, useRef, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSmartRecommendations } from '@/services/analytics_service/analytics';
import Searchbar from '@/components/searchbar/Searchbar';
import ai_button_img from '@/assets/images/Topbar_Buttons/AI_Button.png';
import Notifications from '@/components/notifications/Notifications';
import shop_button_img from "@/assets/images/Topbar_Buttons/Shop_Button.png";
import explore_button_img from "@/assets/images/Topbar_Buttons/Explore_Button.png";
import wallet_button_img from "@/assets/images/Topbar_Buttons/Wallet_Button.png";
import { SongInfo } from '@/services/music_service/songs';
import Alert from '@/components/alert/TwoButtonAlert';
import { useMusic } from '@/contexts/MusicContext';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';

export default function ListenerTopbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile_picture } = useAuth();
    const { playSong, addToQueue } = useMusic();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileWrapperRef = useRef<HTMLDivElement>(null);
    const [recommendedSongs, setRecommendedSongs] = useState<SongInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [aiPopupOpen, setAiPopupOpen] = useState<boolean>(false);
    const [alert, setAlert] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
    const aiPopupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!profileWrapperRef.current?.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Close AI popup on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (aiPopupOpen && !aiPopupRef.current?.contains(e.target as Node)) {
                setAiPopupOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [aiPopupOpen]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && aiPopupOpen) {
                setAiPopupOpen(false);
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [aiPopupOpen]);

    if (!profile_picture) {
        console.log('We should never see this day');
        return null;
    }

    const handleAiSubmit = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setRecommendedSongs([]);
        getSmartRecommendations(prompt).then((songs) => {
            setRecommendedSongs(songs);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    return (
        <div id="topbar">
            {alert && <Alert message={alert} onConfirm={() => setAlert("")} />}

            <div className="topbar_left">
                {/* <div className='topbar-button'><img src={shop_button_img} className="icon" />Shop</div> */}
                {user?.user_type === 'listener' && (
                    <div className='topbar-button' onClick={() => navigate('/explore')}>
                        <img src={explore_button_img} className="icon" />Explore
                    </div>
                )}
            </div>

            <div className="topbar_center">
                <Searchbar prompt={user?.user_type === 'listener' ? 'Explore. Discover. Repeat.' : 'Search...'} song album artist />
                {user?.user_type === "listener" && <div
                    className='topbar-button'
                    onClick={() => {
                        if (user?.listener_type === 'free') {
                            setAlert("Please subscribe to unlock smart recommendations.");
                        } else {
                            setAiPopupOpen(true);
                        }
                    }}
                >
                    <img src={ai_button_img} className="icon" />
                </div>}

                {/* AI Popup */}
                {aiPopupOpen && (
                    <div className="ai-popup" ref={aiPopupRef}>
                        <div className="ai-popup-header">
                            <span className="ai-popup-title">Explain and Explore</span>
                        </div>

                        <textarea
                            className="ai-popup-textarea"
                            placeholder="What's your listening mood today...?"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAiSubmit();
                                }
                            }}
                            rows={4}
                            autoFocus
                        />

                        <div className="ai-popup-submit-row">
                            <button
                                className="ai-popup-submit"
                                onClick={handleAiSubmit}
                                disabled={loading || !prompt.trim()}
                            >
                                {loading ? (
                                    <span className="ai-loading-dots">
                                        <span /><span /><span />
                                    </span>
                                ) : 'Submit'}
                            </button>
                        </div>

                        {(recommendedSongs.length > 0 || loading) && (
                            <div className="ai-popup-results">
                                <div className="ai-results-header">Recommended for you</div>

                                {loading && (
                                    <div className="ai-results-loading">
                                        <span className="ai-loading-dots">
                                            <span /><span /><span />
                                        </span>
                                    </div>
                                )}

                                {recommendedSongs.map((song) => (
                                    <div
                                        key={song.song_id}
                                        className="search_item search_item_song ai-result-item"
                                        onClick={() => {
                                            if (song?.song_id !== undefined) {
                                                setSelectedSongId(song.song_id);
                                                setAiPopupOpen(false);
                                            }
                                        }}
                                    >
                                        {user?.user_type === "listener" && <div
                                            className="play_button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToQueue(song.song_id, true);
                                                playSong({ song_id: song.song_id, progress: 0, playing: true });
                                                setAiPopupOpen(false);
                                            }}
                                        >
                                            ▶
                                        </div>}
                                        <div className="search_item_text">
                                            <span className="search_item_title">{song.title}</span>
                                            <span
                                                className="search_item_artist_name"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/artists/${song.owner_id}`);
                                                    setAiPopupOpen(false);
                                                }}
                                            >
                                                {song.owner_name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="topbar_right">
                {/* {user?.user_type === 'listener' && (
                    <div className='topbar-button' onClick={() => navigate('/explore')}>
                        <img src={explore_button_img} className="icon" />Explore
                    </div>
                )} */}
                {/* {user?.user_type === 'artist' && (
                    <div className='topbar-button'><img src={wallet_button_img} className="icon" />Wallet</div>
                )} */}
                <Notifications />
                <div ref={profileWrapperRef} className="profile_wrapper">
                    <div className="profile_picture" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProfileDropdownOpen(!profileDropdownOpen);
                    }}>
                        <img className="profile_picture_img" src={profile_picture} />
                    </div>
                    <div className="profile_dropdown" style={{ display: profileDropdownOpen ? "block" : "none" }}>
                        <div className='profile-dropdown-option' onClick={() => { setProfileDropdownOpen(false); navigate('/my-profile'); }}>Profile</div>
                        <div className='profile-dropdown-option' onClick={() => { navigate('/sign-out'); }}>Sign Out</div>
                    </div>
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