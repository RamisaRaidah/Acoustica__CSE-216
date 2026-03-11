import { SubmitEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboarding } from "@/services/auth.ts";
import { Typewriter } from "@/components/auth/typewriter";

import logo_img from '@/assets/images/Deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';

function Onboarding(){
    const navigate=useNavigate();
    const [bio, setBio]=useState('');
    const [country_id, setCountryId]=useState('');
    const [language_id, setLanguageId] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [user_type,setUserType]=useState('');
    const [gender, setGender] = useState('');
    const [date_of_birth, setDateOfBirth] = useState('');
    const [theme, setTheme] = useState('');
    const [pfp, setPfp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    

    const user = JSON.parse(localStorage.getItem('user')||'');
    setUserType(user?.user_type);


    const handleSubmit: SubmitEventHandler<HTMLFormElement>=async(e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('user_type:', user_type);
        const formData=new FormData();
        formData.append('bio',bio);
        formData.append('country_id',country_id);
        formData.append('language_id',language_id);
        formData.append('phone_number',phone_number);
        formData.append('gender',gender);
        formData.append('date_of_birth',date_of_birth);
        formData.append('theme',theme);
        pfp = request.files.get("pfp")
        
            try {
                const response = await onboarding(formData);
                console.log('Welp, what happened now');
                if (response && response.message) {
                    localStorage.setItem('theme', theme||'light');
                    const theme = localStorage.getItem('theme');
                    if (theme === 'dark') {
                        document.body.classList.add('dark');
                    }
                    else {
                        document.body.classList.remove('dark');
                    }
    
                    const user = JSON.parse(localStorage.getItem('user')||'');
                    user.onboarding_done = true;
                    localStorage.setItem('user', JSON.stringify(user))
    
                    navigate('/dashboard');
                } else {
                    throw new Error('Onboarding failed');
                }
            } catch (error) {
                errorDiv.textContent = error.message || 'Something went wrong. Please try again.';
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = "Let's Go";
            }
    }


    return(
        <div className="auth-container">
            <div className="auth-logo">
                <img src={logo_img} id="logo" alt="sign-up_logo"></img>
                <img src={name_img} id="acoustica" alt="sign-up_name"></img>
            </div>

             <div className="auth-left">
                <Typewriter lines={["Discover", "your", "new favourites"]}></Typewriter>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>Set Up Your Profile</h1>
                </div>

                <form onSubmit={handleSubmit} id="onboarding-form" className="auth-form">

                    <div className="form-group pfp-group">
                        <label>Profile Picture</label>

                        <div class="pfp-wrapper">
                            <img 
                                id="pfp-preview" 
                                class="pfp-preview"
                                src="src/assets/images/Default_pfp.png"
                                alt="Profile Preview"
                            >

                            <div class="pfp-overlay">
                                <span>Change</span>
                            </div>

                            <input 
                                type="file" 
                                id="pfp" 
                                name="pfp" 
                                accept="image/png, image/jpeg, image/webp"
                                hidden
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea 
                        id="bio" 
                        name="bio" 
                        placeholder="Tell us about yourself..."
                        maxlength="200"></textarea>
                        <small id="bio-counter" style="color: #5c6465; text-align: right;">0/200</small>
                    </div>

                    <div class="form-group">
                        <label for="country_id">Country</label>
                        <select id="country_id" name="country_id">
                            <option value="">Loading countries...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="language_id">Language</label>
                        <select id="language_id" name="language_id">
                            <option value="">Loading languages...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="phone_number">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phone_number" 
                            name="phone_number" 
                            placeholder="e.g. +1234567890" 
                        />
                    </div>

                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender">
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="date_of_birth">Date of Birth</label>
                        <input 
                            type="date" 
                            id="date_of_birth"
                            name="date_of_birth" 
                        />
                    </div>

                    <div class="form-group">
                        <label for="theme">Theme</label>
                        <select id="theme" name="theme">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                
                    <div class="form-group">
                        <label for="stage_name">Stage Name</label>
                        <input 
                            type="text" 
                            id="stage_name"  
                            name="stage_name"
                            placeholder="Your artist name" 
                        />
                    </div>
                    <div class="form-group">
                        <label for="bank_account">Bank Account</label>
                        <input 
                            type="text" 
                            id="bank_account" 
                            name="bank_account"
                            placeholder="Your bank account number" 
                        />
                    </div>
                
                    <div id="error-message" class="error-message"></div>

                    <button type="submit" class="btn-primary" id="onboarding-btn">
                        Let's Go
                    </button>
                </form>
            </div>
        </div>
    );
}