import '@/components/sidebar/Sidebar.module.css';
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import logo_img from '@/assets/images/Deco/Logo.png';
import name_img_light from '@/assets/images/Deco/Acoustica1.png';
import name_img_dark from '@/assets/images/Deco/Acoustica2.png';
import home_button_img from '@/assets/images/sidebar_buttons/Home_Button.png';
import library_button_img from '@/assets/images/sidebar_buttons/Library_Button.png';
import playlist_button_img from '@/assets/images/sidebar_buttons/Playlist_Button.png';
import artist_button_img from '@/assets/images/sidebar_buttons/Artist_Button.png';
import community_button_img from '@/assets/images/sidebar_buttons/Community_Button.png';
import subscription_button_img from '@/assets/images/sidebar_buttons/Subscription_Button.png';
import report_button_img from '@/assets/images/sidebar_buttons/Report_Button.png';
import settings_button_img from '@/assets/images/sidebar_buttons/Settings_Button.png';

function ListenerSidebar() {
    const { theme, toggleTheme } = useTheme();

    const iconFilter = { filter: theme === "light" ? "invert(0)" : "invert(1)" };

    return (
        <div className="sidebar">
            <div className="app_info">
                <img src={logo_img} className="logo" />
                <img src={theme === "light" ? name_img_light : name_img_dark} className="app_name" />
            </div>

            <div className="sidebar_navigation_top">
                <Link to="/dashboard" className="home_button"><img src={home_button_img} style={iconFilter} />Home</Link>
                <Link to="#" className="library_button"><img src={library_button_img} style={iconFilter} />Library</Link>
                <Link to="/music/playlists" className="playlist_button"><img src={playlist_button_img} style={iconFilter} />Playlists</Link>
                <Link to="/artists" className="artist_button"><img src={artist_button_img} style={iconFilter} />Artists</Link>
                <Link to="#" className="community_button"><img src={community_button_img} style={iconFilter} />Community</Link>
                <Link to="#" className="subscription_button"><img src={subscription_button_img} style={iconFilter} />Subscriptions</Link>
            </div>

            <div className="sidebar_navigation_bottom">
                <Link to="#" className="report_button"><img src={report_button_img} style={iconFilter} />Report</Link>
                <Link to="#" className="settings_button"><img src={settings_button_img} style={iconFilter} />Settings</Link>
                <Link to="#" className="about_us_button">About us</Link>
            </div>
        </div>
    );
}

export default ListenerSidebar;