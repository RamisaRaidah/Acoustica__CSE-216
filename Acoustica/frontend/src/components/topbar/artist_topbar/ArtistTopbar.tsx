import '@/components/topbar/Topbar.css';
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from "react-router-dom";
import Searchbar from '@/components/searchbar/Searchbar';
import shop_button_img from "@/assets/images/Topbar_Buttons/Shop_Button.png";
import wallet_button_img from "@/assets/images/Topbar_Buttons/Wallet_Button.png";
import Notifications from '@/components/notifications/Notifications';

export default function ArtistTopbar() {
    const { theme, toggleTheme } = useTheme();
    const { profile_picture } = useAuth();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!profileWrapperRef.current?.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    if (!profile_picture) return null;

    return (
        <div className="topbar">
            <div className="topbar_left">
                <Link to="#" className="shop_button"><img src={shop_button_img} className="icon" />Shop</Link>
            </div>
            <div className="topbar_center">
                <Searchbar prompt="Search..." song album artist />
            </div>
            <div className="topbar_right">
                <Link to="#" className="wallet_button"><img src={wallet_button_img} className="icon" />Wallet</Link>
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