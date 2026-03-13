import { getMyProfile } from "@/services/profile.ts";
import { Scrollbar } from "@/components/scrollbar/Scrollbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/topbar/Topbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "@/pages/profile/private/my_profile.css"
import { useAuth } from "@/contexts/AuthContext";

interface GetMyProfileResponse{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    bio: string;
    theme: string;
    profile_picture: string;
    user_type: string;
    country_name: string;
    language_name: string;
    listener_type: string;
    stage_name: string;
    bank_account: string;
}

function MyProfile(){
    const navigate=useNavigate();
    const [data, setData]=useState<GetMyProfileResponse | null>(null);
    const { profile_picture } = useAuth();

    useEffect(()=>{
        async function fetch(){
            const res= await getMyProfile();
            if(!res){
                console.error('No response for my profile found!!');
                navigate('/unauthorized');
                return;
            }
            setData(res);
        }
        fetch();
    },[navigate]);
    
    
    if(!data){
        return(
            <div className="My_Profile_Container">
                <Sidebar />
                <Topbar />
                <Scrollbar />
                <div className="profile-page">
                    <div className="page-header">
                        <h1>My Profile</h1>
                    </div>

                    <div className="profile-layout">
                        <div className="profile-left">
                            <div className="identity-card">
                                <div className="pfp-ring">
                                    <img id="profile-pfp" src="" alt="Profile picture" />
                                </div>
                                <div className="profile-name" id="profile-name">
                                    -
                                </div>
                                <div className="profile-badge" id="profile-badge">
                                    ⬤ &nbsp;-
                                </div>
                                <p className="profile-bio" id="profile-bio">
                                    -
                                </p>
                            </div>
                        </div>
                        <div className="profile-right">

                            <div className="info-card">
                                <div className="card-header">
                                    <div className="card-icon">👤</div>
                                    <h2>Personal Info</h2>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        First Name
                                    </span>
                                    <span className="info-value" id="field-first-name">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Last Name
                                    </span>
                                    <span className="info-value" id="field-last-name">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Gender
                                    </span>
                                    <span className="info-value" id="field-gender">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Date of Birth
                                    </span>
                                    <span className="info-value" id="field-dob">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Country
                                    </span>
                                    <span className="info-value" id="field-country">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Language
                                    </span>
                                    <span className="info-value" id="field-language">
                                        -
                                    </span>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="card-header">
                                    <div className="card-icon">🔐</div>
                                    <h2>Account Info</h2>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Email
                                    </span>
                                    <span className="info-value" id="field-email">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Phone Number
                                    </span>
                                    <span className="info-value" id="field-phone">
                                        -
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">
                                        Theme
                                    </span>
                                    <span className="info-value" id="field-theme">
                                        -
                                    </span>
                                </div>
                            </div>

                            <div className="info-card" id="role-card">
                                <div className="card-header">
                                    <div className="card-icon" id="role-card-icon">🎵</div>
                                    <h2 id="role-card-title">Details</h2>
                                </div>
                                <div id="role-card-body"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className="My_Profile_Container">
            <Sidebar />
            <Topbar />
            <Scrollbar />
            <div className="profile-page">
                <div className="page-header">
                    <h1>My Profile</h1>
                </div>

                <div className="profile-layout">
                    <div className="profile-left">
                        <div className="identity-card">
                            <div className="pfp-ring">
                                <img id="profile-pfp" src={profile_picture?profile_picture:data.profile_picture} alt="Profile picture" />
                            </div>
                            <div className="profile-name" id="profile-name">
                                {data.first_name} {data.last_name}
                            </div>
                            <div className="profile-badge" id="profile-badge">
                                ⬤ &nbsp;{data.user_type}
                            </div>
                            <p className="profile-bio" id="profile-bio">
                                {data.bio}
                            </p>
                        </div>
                    </div>
                    <div className="profile-right">

                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">👤</div>
                                <h2>Personal Info</h2>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    First Name
                                </span>
                                <span className="info-value" id="field-first-name">
                                    {data.first_name}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Last Name
                                </span>
                                <span className="info-value" id="field-last-name">
                                    {data.last_name}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Gender
                                </span>
                                <span className="info-value" id="field-gender">
                                    {data.gender}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Date of Birth
                                </span>
                                <span className="info-value" id="field-dob">
                                    {data.date_of_birth}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Country
                                </span>
                                <span className="info-value" id="field-country">
                                    {data.country_name}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Language
                                </span>
                                <span className="info-value" id="field-language">
                                    {data.language_name}
                                </span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon">🔐</div>
                                <h2>Account Info</h2>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Email
                                </span>
                                <span className="info-value" id="field-email">
                                    {data.email}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Phone Number
                                </span>
                                <span className="info-value" id="field-phone">
                                    {data.phone_number}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">
                                    Theme
                                </span>
                                <span className="info-value" id="field-theme">
                                    {data.theme}
                                </span>
                            </div>
                        </div>

                        <div className="info-card" id="role-card">
                            <div className="card-header">
                                <div className="card-icon" id="role-card-icon">
                                    {data.user_type === "listener"
                                        ? "🎧"
                                        : data.user_type === "artist"
                                        ? "🎤"
                                        : "🎵"
                                    }
                                </div>
                                <h2 id="role-card-title">
                                    Details
                                </h2>
                            </div>
                            <div id="role-card-body">
                                {data.user_type==='listener' && (
                                     <div className="info-row">
                                        <span className="info-label">
                                            Subscription
                                        </span>
                                        <span className="info-value">
                                            <span className="profile-type-badge">
                                                {data.listener_type ?? 'free'}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {data.user_type==='artist' &&(
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">Stage Name</span>
                                            <span className="info-value">{(data.stage_name)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Bank Account</span>
                                            <span className="info-value">${(data.bank_account)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;