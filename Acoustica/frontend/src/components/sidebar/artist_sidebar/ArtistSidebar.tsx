import '@/components/sidebar/Sidebar.css';
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import logo_img from '@/assets/images/deco/Logo.png';
import name_img_light from '@/assets/images/deco/Acoustica1.png';
import name_img_dark from '@/assets/images/deco/Acoustica2.png';
import home_button_img from '@/assets/images/Sidebar_Buttons/Home_Button.png';
import discography_button_img from '@/assets/images/Sidebar_Buttons/Discography_Button.png';
import create_album_button_img from '@/assets/images/Sidebar_Buttons/Create_Album_Button.png';
import upload_song_button_img from '@/assets/images/Sidebar_Buttons/Upload_Song_Button.png';
import draft_button_img from '@/assets/images/Sidebar_Buttons/Draft_Button.png';
import approval_status_button_img from '@/assets/images/Sidebar_Buttons/Approval_Status_Button.png';
import report_button_img from '@/assets/images/Sidebar_Buttons/Report_Button.png';
import settings_button_img from '@/assets/images/Sidebar_Buttons/Settings_Button.png';

export function ArtistSidebar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="sidebar">
            <div className="app_info">
                <img src={logo_img} className="logo" />
                <img src={theme === "light" ? name_img_light : name_img_dark} className="app_name" />
            </div>

            <div className="sidebar_navigation_top">
                <Link to="/dashboard" className="home_button"><img src={home_button_img} className="icon" />Home</Link>
                <Link to="/dashboard" className="discography_button"><img src={discography_button_img} className="icon" />Discography</Link>
                <Link to="/music/create-album" className="create_album_button"><img src={create_album_button_img} className="icon" />Create album</Link>
                <Link to="/music/upload-song" className="upload_song_button"><img src={upload_song_button_img} className="icon" />Upload song</Link>
                <Link to="/dashboard" className="draft_button"><img src={draft_button_img} className="icon" />Drafts</Link>
                <Link to="/dashboard" className="approval_status_button"><img src={approval_status_button_img} className="icon" />Approval status</Link>
            </div>

            <div className="sidebar_navigation_bottom">
                <Link to="#" className="report_button"><img src={report_button_img} className="icon" />Report</Link>
                <Link to="#" className="settings_button"><img src={settings_button_img} className="icon" />Settings</Link>
                <Link to="#" className="about_us_button">About us</Link>
            </div>
        </div>
    );
}