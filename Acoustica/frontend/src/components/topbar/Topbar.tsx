import '@/components/topbar/Topbar.css';
import { useEffect, useRef, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Searchbar from '@/components/searchbar/Searchbar';
import Notifications from '@/components/notifications/Notifications';
import shop_button_img from "@/assets/images/Topbar_Buttons/Shop_Button.png";
import explore_button_img from "@/assets/images/Topbar_Buttons/Explore_Button.png";
import wallet_button_img from "@/assets/images/Topbar_Buttons/Wallet_Button.png";

export default function ListenerTopbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    if (!profile_picture) {
        console.log('We should never see this day');
        return null;
    }

    return (
        <div id="topbar">
            <div className="topbar_left">
                <div className='topbar-button'><img src={shop_button_img} className="icon" />Shop</div>
            </div>
            <div className="topbar_center">
                <Searchbar prompt={user?.user_type === 'listener' ? 'Explore. Discover. Repeat.' : 'Search...'} song album artist />
            </div>
            <div className="topbar_right">
                {user?.user_type === 'listener' && <div className='topbar-button' onClick={() => navigate('/explore')}><img src={explore_button_img} className="icon" />Explore</div>}
                {user?.user_type === 'artist' && <div className='topbar-button'><img src={wallet_button_img} className="icon" />Wallet</div>}
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
        </div>
    );
}