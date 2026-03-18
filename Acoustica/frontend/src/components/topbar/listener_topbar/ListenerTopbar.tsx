import '@/components/topbar/Topbar.css';
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from "react-router-dom";
import Searchbar from '@/components/searchbar/Searchbar';
import shop_button_img from "@/assets/images/Topbar_Buttons/Shop_Button.png";
import explore_button_img from "@/assets/images/Topbar_Buttons/Explore_Button.png";
import { useMusic } from '@/contexts/MusicContext';
import Notifications from '@/components/notifications/Notifications';

export default function ListenerTopbar() {
    const { theme, toggleTheme } = useTheme();
    const { profile_picture } = useAuth();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileWrapperRef = useRef<HTMLDivElement>(null);
    const { playSong } = useMusic();

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!profileWrapperRef.current?.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    if (!profile_picture){
        console.log('We should never see this day');
        return null;
    }

    return (
        <div className="topbar">
            <div className="topbar_left">
                <Link to="#" className="shop_button"><img src={shop_button_img} className="icon" />Shop</Link>
            </div>
            <div className="topbar_center">
                <Searchbar prompt='Explore. Discover. Repeat.' song album artist onSongSelect={(song) => playSong({ song_id: song.song_id, album_id: song.album_id, title: song.title, artist_name: song.artist_name, progress: 0, playing: true })} />
            </div>
            <div className="topbar_right">
                <Link to="#" className="explore_button"><img src={explore_button_img} className="icon" />Explore</Link>
                <button className="toggle_button" onClick={toggleTheme}>Theme</button>
                <Notifications/>
                <div ref={profileWrapperRef} className="profile_wrapper">
                    <div className="profile_picture" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProfileDropdownOpen(!profileDropdownOpen);
                    }}>
                        <img className="profile_picture_img" src={profile_picture} />
                    </div>
                    <div className="profile_dropdown" style={{ display: profileDropdownOpen ? "block" : "none" }}>
                        <Link to="/my-profile" className="profile_option" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                        <Link to="/sign-out" className="signout_option">Sign Out</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}