import '@/components/sidebar/Sidebar.css';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Settings from '@/pages/user/settings/Settings';
import CreateReport from '@/pages/reports/create_report/CreateReport';
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
import discography_button_img from '@/assets/images/Sidebar_Buttons/Discography_Button.png';
import create_album_button_img from '@/assets/images/Sidebar_Buttons/Create_Album_Button.png';
import upload_song_button_img from '@/assets/images/Sidebar_Buttons/Upload_Song_Button.png';
import draft_button_img from '@/assets/images/Sidebar_Buttons/Draft_Button.png';
import approval_status_button_img from '@/assets/images/Sidebar_Buttons/Approval_Status_Button.png';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const listenerType = user?.listener_type ?? 'free';
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [createReportOpen, setCreateReportOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div id='sidebar-container'>
            <div className='app_info'>
                <img src={logo_img} className='logo' />
                <img src={theme === 'light' ? name_img_light : name_img_dark} className='app_name' />
            </div>

            <div className='sidebar_navigation_top'>
                <div className='sidebar-button' onClick={() => navigate('/dashboard')}><img src={home_button_img} className='icon' />Home</div>
                {
                    user?.user_type === 'listener' && 
                    <>
                        <div className='sidebar-button' onClick={() => navigate('/music/library')}><img src={library_button_img} className='icon' />Library</div>
                        <div className='sidebar-button' onClick={() => navigate('/music/playlists')}><img src={playlist_button_img} className='icon' />Playlists</div>
                        <div className='sidebar-button' onClick={() => navigate('/artists')}><img src={artist_button_img} className='icon' />Artists</div>
                        <div className='sidebar-button' onClick={() => navigate('/my-family')}><img src={community_button_img} className='icon' />Community</div>
                        <div className='sidebar-button' onClick={() => (listenerType === 'free') ? navigate('/plans') : navigate('/subscription-details')}><img src={subscription_button_img} className='icon' />Subscriptions</div>
                    </>
                }
                {
                    user?.user_type === 'artist' && 
                    <>
                        <div className='sidebar-button' onClick={() => navigate('/discography')}><img src={discography_button_img} className='icon' />Discography</div>
                        <div className='sidebar-button' onClick={() => navigate('/music/create-album')}><img src={create_album_button_img} className='icon' />Create album</div>
                        <div className='sidebar-button' onClick={() => navigate('/music/upload-song')}><img src={upload_song_button_img} className='icon' />Upload song</div>
                        {/* <div className='sidebar-button' onClick={() => navigate('/dashboard')}><img src={draft_button_img} className='icon' />Drafts</div> */}
                        {/* <div className='sidebar-button' onClick={() => navigate('/dashboard')}><img src={approval_status_button_img} className='icon' />Approval status</div> */}
                    </>
                }
                {
                    user?.user_type=='admin' &&
                    <>
                        <div className='sidebar-button' onClick={()=> navigate('/reports')}><img src={draft_button_img} className='icon'/>Reports</div>
                        <div className='sidebar-button' onClick={()=> navigate('/activity-log')}><img src={discography_button_img} className='icon'/>Activity Log</div> 
                        <div className='sidebar-button' onClick={()=> navigate('/admin-analytics')}><img src={approval_status_button_img} className='icon'/>Analytics</div>
                    </>
                }
            </div>

            <div className='sidebar_navigation_bottom'>
                {user?.user_type !== "admin" && <div className='sidebar-button' onClick={() => setCreateReportOpen(true)}><img src={report_button_img} className='icon' />Report</div>}
                <div className='sidebar-button' onClick={() => setSettingsOpen(true)}><img src={settings_button_img} className='icon' />Settings</div>
                <div className='sidebar-button' id='aboutus-button' onClick={()=>navigate('/about-us')}>About us</div>
            </div>

            <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <CreateReport isOpen={createReportOpen} onClose={() => setCreateReportOpen(false)} />
        </div>
    )
}