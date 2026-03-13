import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";
import { MusicPlayer } from "@/components/music_player/MusicPlayer";
import { Scrollbar } from "@/components/scrollbar/Scrollbar";
import { getLastListening } from "@/services/user";
import { useEffect } from "react";
// import banner_img from '@/assets/images/Deco/Banner2.png';

export function ListenerDashboard() {
    useEffect(() => {
        getLastListening().then(res => localStorage.setItem("song", JSON.stringify({"song_id": res.song_id, "album_id": res.album_id, "title": res.title, "artist_name": res.artist_name, "progress": res.progress, "playing": false})))
    }, []);

    return (
        <div className="dashboard_container">
            <Sidebar />
            <Topbar />
            <MusicPlayer />
            <Scrollbar />

            {/* <div className="banner1_wrapper">
                <div className="banner1_inner">
                    <img src={banner_img} className="banner1" />
                </div>
            </div> */}
        </div>
    );
}