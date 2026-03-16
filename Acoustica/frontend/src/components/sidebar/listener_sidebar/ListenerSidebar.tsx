import '@/components/sidebar/Sidebar.css';
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import logo_img from '@/assets/images/deco/Logo.png';
import name_img_light from '@/assets/images/deco/Acoustica1.png';
import name_img_dark from '@/assets/images/deco/Acoustica2.png';
import home_button_img from '@/assets/images/Sidebar_Buttons/Home_Button.png';
import library_button_img from '@/assets/images/Sidebar_Buttons/Library_Button.png';
import playlist_button_img from '@/assets/images/Sidebar_Buttons/Playlist_Button.png';
import artist_button_img from '@/assets/images/Sidebar_Buttons/Artist_Button.png';
import community_button_img from '@/assets/images/Sidebar_Buttons/Community_Button.png';
import subscription_button_img from '@/assets/images/Sidebar_Buttons/Subscription_Button.png';
import report_button_img from '@/assets/images/Sidebar_Buttons/Report_Button.png';
import settings_button_img from '@/assets/images/Sidebar_Buttons/Settings_Button.png';

export default function ListenerSidebar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="sidebar">
            <div className="app_info">
                <img src={logo_img} className="logo" />
                <img src={theme === "light" ? name_img_light : name_img_dark} className="app_name" />
            </div>

            <div className="sidebar_navigation_top">
                <Link to="/dashboard" className="home_button"><img src={home_button_img} className="icon" />Home</Link>
                <Link to="#" className="library_button"><img src={library_button_img} className="icon" />Library</Link>
                <Link to="/music/playlists" className="playlist_button"><img src={playlist_button_img} className="icon" />Playlists</Link>
                <Link to="/artists" className="artist_button"><img src={artist_button_img} className="icon" />Artists</Link>
                <Link to="#" className="community_button"><img src={community_button_img} className="icon" />Community</Link>
                <Link to="/plans" className="subscription_button"><img src={subscription_button_img} className="icon" />Subscriptions</Link>
            </div>

            <div className="sidebar_navigation_bottom">
                <Link to="#" className="report_button"><img src={report_button_img} className="icon" />Report</Link>
                <Link to="#" className="settings_button"><img src={settings_button_img} className="icon" />Settings</Link>
                <Link to="#" className="about_us_button">About us</Link>
            </div>
        </div>
    );
}