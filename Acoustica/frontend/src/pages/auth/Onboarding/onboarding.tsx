import { ChangeEvent, SubmitEventHandler, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCountries, getLanguages, onboarding } from "@/services/auth.ts";
import { Typewriter } from "@/components/auth/typewriter";

import logo_img from '@/assets/images/Deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';
import default_pfp_img from '@/assets/images/Default_pfp.png'

interface Country{
    country_id: number;
    country_name: string;
}

interface Language{
    language_id:number;
    language_name: string;
}

function Onboarding(){
    const navigate=useNavigate();
    const [bio, setBio]=useState<string>('');
    const [country_id, setCountryId]=useState<string>('');
    const [language_id, setLanguageId] = useState<string>('');
    const [phone_number, setPhoneNumber] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [date_of_birth, setDateOfBirth] = useState<string>('');
    const [theme, setTheme] = useState<string>('');
    const [pfp, setPfp] = useState<File|null>(null);
    const [pfp_Preview, setPfpPreview]= useState<string>(default_pfp_img);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [stage_name, setStageName] = useState<string>('');
    const [bank_account, setBankAccount] = useState<string>('');
    
    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [user_type, setUserType] = useState<'listener' | 'artist'>('listener');
    

    useEffect(() => {
        const loadData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
            const user = JSON.parse(userStr);
            setUserType(user.user_type);
            }

            const [countriesData, languagesData] = await Promise.all([
            getCountries(),
            getLanguages()
            ]);

            setCountries(countriesData);
            setLanguages(languagesData);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load countries and languages');
        }
        };

        loadData();
    }, []);
    
    console.log('Done with countries and languages');

    const handlePfpChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
        setPfp(file);
        
        const reader = new FileReader();
        reader.onload = () => {
            setPfpPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    


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
        if (pfp) {
        formData.append('pfp', pfp);
      }

        if (user_type === 'artist') {
            formData.append('stage_name', stage_name);
            formData.append('bank_account', bank_account);
        }

        
        try {
            const response = await onboarding(formData);
            if (response && response.message) {
                localStorage.setItem('theme', theme);
                if (theme === 'dark') {
                    document.body.classList.add('dark');
                }
                else {
                    document.body.classList.remove('dark');
                }

                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.onboarding_done = true;
                    localStorage.setItem('user', JSON.stringify(user));
                }else {
                    throw new Error('Onboarding failed');
                }

                navigate('/dashboard');
            } else {
                throw new Error('Onboarding failed');
            }
        } catch (err) {
            console.error('Onboarding error:', err);
            if(err instanceof Error){
                setError(err.message);
            }else{
                setError('An unexpected error occurred');
            }
        }finally{
            setLoading(false);
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

                        <div className="pfp-wrapper" onClick={() => document.getElementById('pfp')?.click()}>
                            <img 
                                id="pfp-preview" 
                                className="pfp-preview"
                                src={pfp_Preview}
                                alt="Profile Preview"
                            />

                            <div className="pfp-overlay">
                                <span>Change</span>
                            </div>

                            <input
                                type="file"
                                id="pfp"
                                name="pfp"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handlePfpChange}
                                hidden
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={bio}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                        />
                        <small style={{ color: '#5c6465', textAlign: 'right', display: 'block' }}>
                            {bio.length}/200
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="country_id">Country</label>
                        <select
                        id="country_id"
                        name="country_id"
                        value={country_id}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setCountryId(e.target.value)}
                        required
                        >
                        <option value="">Select your country</option>
                        {countries.map(c => (
                            <option key={c.country_id} value={c.country_id}>
                            {c.country_name}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="language_id">Language</label>
                        <select
                        id="language_id"
                        name="language_id"
                        value={language_id}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguageId(e.target.value)}
                        required
                        >
                        <option value="">Select your language</option>
                        {languages.map(l => (
                            <option key={l.language_id} value={l.language_id}>
                            {l.language_name}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phone_number" 
                            name="phone_number"
                            value={phone_number}
                            onChange={(e:ChangeEvent<HTMLInputElement>)=>setPhoneNumber(e.target.value)} 
                            placeholder="e.g. +1234567890" 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={gender}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_of_birth">Date of Birth</label>
                        <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={date_of_birth}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="theme">Theme</label>
                        <select
                            id="theme"
                            name="theme"
                            value={theme}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    {user_type === 'artist' && (
                        <>
                        <div className="form-group">
                            <label htmlFor="stage_name">Stage Name</label>
                            <input
                                type="text"
                                id="stage_name"
                                name="stage_name"
                                value={stage_name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setStageName(e.target.value)}
                                placeholder="Your artist name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bank_account">Bank Account</label>
                            <input
                                type="text"
                                id="bank_account"
                                name="bank_account"
                                value={bank_account}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setBankAccount(e.target.value)}
                                placeholder="Your bank account number"
                            />
                        </div>
                        </>
                    )}

                    {error && (
                        <div className="error-message" style={{ display: 'block' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Setting up...' : "Let's Go"}
                    </button>
                </form>
        </div>
    </div>
  );
}

export default Onboarding;