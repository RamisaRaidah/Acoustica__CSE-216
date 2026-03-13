import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";
import { Scrollbar } from "@/components/scrollbar/Scrollbar";
// import banner_img from '@/assets/images/Deco/Banner2.png';

export function ArtistDashboard() {
    return (
        <div className="dashboard_container">
            <Sidebar />
            <Topbar />
            <Scrollbar />

            {/* <div className="banner1_wrapper">
                <div className="banner1_inner">
                    <img src={banner_img} className="banner1" />
                </div>
            </div> */}
        </div>
    );
}