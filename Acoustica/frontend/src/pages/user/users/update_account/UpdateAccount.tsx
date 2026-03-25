import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCountries, Country, getLanguages, Language } from "@/services/analytics_service/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { updateAccount } from "@/services/user_service/users";
import '@/pages/user/users/update_account/UpdateAccount.css'

import default_pfp_img from '@/assets/images/Default_pfp.png';
import { getMyProfile } from "@/services/user_service/users";

interface OriginalValues {
    bio: string;
    country_id: string;
    language_id: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    stage_name: string;
    bank_account: string;
}

function UpdateAccount() {
    const navigate = useNavigate();

    const [bio, setBio] = useState<string>('');
    const [country_id, setCountryId] = useState<string>('');
    const [language_id, setLanguageId] = useState<string>('');
    const [phone_number, setPhoneNumber] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer not to say'>('prefer not to say');
    const [date_of_birth, setDateOfBirth] = useState<string>('');
    const [pfp, setPfp] = useState<File | null>(null);
    const [pfp_preview, setPfpPreview] = useState<string>(default_pfp_img);

    const [stage_name, setStageName] = useState<string>('');
    const [bank_account, setBankAccount] = useState<string>('');

    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);

    const [original, setOriginal] = useState<OriginalValues | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const { user, refreshProfilePicture } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [countriesData, languagesData, profileData] = await Promise.all([
                    getCountries(),
                    getLanguages(),
                    getMyProfile()
                ]);

                setCountries(countriesData);
                setLanguages(languagesData);

            
                const dob = profileData.date_of_birth
                    ? profileData.date_of_birth.split('T')[0]
                    : '';

              
                const matchedCountry  = countriesData.find(c => c.country_name  === profileData.country_name);
                const matchedLanguage = languagesData.find(l => l.language_name === profileData.language_name);

                const initialCountryId  = matchedCountry  ? String(matchedCountry.country_id)   : '';
                const initialLanguageId = matchedLanguage ? String(matchedLanguage.language_id) : '';

                setBio(profileData.bio ?? '');
                setCountryId(initialCountryId);
                setLanguageId(initialLanguageId);
                setPhoneNumber(profileData.phone_number ?? '');
                setGender((profileData.gender as typeof gender) ?? 'prefer not to say');
                setDateOfBirth(dob);
                setStageName(profileData.stage_name ?? '');
                setBankAccount(profileData.bank_account ?? '');
                setPfpPreview(profileData.profile_picture || default_pfp_img);

               
                setOriginal({
                    bio:           profileData.bio          ?? '',
                    country_id:    initialCountryId,
                    language_id:   initialLanguageId,
                    phone_number:  profileData.phone_number ?? '',
                    gender:        profileData.gender       ?? 'prefer not to say',
                    date_of_birth: dob,
                    stage_name:    profileData.stage_name   ?? '',
                    bank_account:  profileData.bank_account ?? '',
                });

            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load profile data');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    const handlePfpChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPfp(file);
            const reader = new FileReader();
            reader.onload = () => setPfpPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData();


        if (original) {
            if (bio           !== original.bio)            formData.append('bio', bio);
            if (country_id    !== original.country_id)     formData.append('country_id', country_id);
            if (language_id   !== original.language_id)    formData.append('language_id', language_id);
            if (phone_number  !== original.phone_number)   formData.append('phone_number', phone_number);
            if (gender        !== original.gender)         formData.append('gender', gender);
            if (date_of_birth !== original.date_of_birth)  formData.append('date_of_birth', date_of_birth);

            if (user?.user_type === 'artist') {
                if (stage_name   !== original.stage_name)   formData.append('stage_name', stage_name);
                if (bank_account !== original.bank_account) formData.append('bank_account', bank_account);
            }
        }

        
        if (pfp) formData.append('pfp', pfp);

        if ([...formData.entries()].length === 0) {
            setSuccess('No changes to save.');
            setLoading(false);
            return;
        }

        try {
            const response = await updateAccount(formData);
            if (response && response.message) {
                setSuccess('Account updated successfully!');
                await refreshProfilePicture();
                setTimeout(() => {
                    navigate('/my-profile');
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            console.error('Update account error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <div className="loading">Loading</div>;
    }

    return (
        <div className="update-account-container">
            <div className="update-account-header">
                <h1>Edit Profile</h1>
                <p>Only the fields you change will be updated</p>
            </div>

            <form onSubmit={handleSubmit} className="update-account-form">
                <div className="update-account-left">

                    {/* PFP */}
                    <div className="ua-section-title">Profile Picture</div>
                    <div className="ua-pfp-group">
                        <div className="ua-pfp-wrapper" onClick={() => document.getElementById('pfp')?.click()}>
                            <img
                                id="pfp-preview"
                                className="ua-pfp-preview"
                                src={pfp_preview}
                                alt="Profile Preview"
                            />
                            <div className="ua-pfp-overlay"><span>Change</span></div>
                            <input
                                type="file"
                                id="pfp"
                                name="pfp"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handlePfpChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="ua-section-title">About</div>
                    <div className="ua-form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                        />
                        <small className="ua-char-count">{bio.length}/200</small>
                    </div>

                    {/* Artist fields */}
                    {user?.user_type === 'artist' && (
                        <>
                            <div className="ua-section-title">Artist Info</div>
                            <div className="ua-form-group">
                                <label htmlFor="stage_name">Stage Name</label>
                                <input
                                    type="text"
                                    id="stage_name"
                                    value={stage_name}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setStageName(e.target.value)}
                                    placeholder="Your artist name"
                                />
                            </div>
                            <div className="ua-form-group">
                                <label htmlFor="bank_account">Bank Account</label>
                                <input
                                    type="text"
                                    id="bank_account"
                                    value={bank_account}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBankAccount(e.target.value)}
                                    placeholder="Your bank account number"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="update-account-right">
                    <div className="ua-section-title">Personal Details</div>

                    <div className="ua-form-group">
                        <label htmlFor="country_id">Country</label>
                        <select
                            id="country_id"
                            value={country_id}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCountryId(e.target.value)}
                        >
                            <option value="">Select your country</option>
                            {countries.map(c => (
                                <option key={c.country_id} value={c.country_id}>
                                    {c.country_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ua-form-group">
                        <label htmlFor="language_id">Language</label>
                        <select
                            id="language_id"
                            value={language_id}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguageId(e.target.value)}
                        >
                            <option value="">Select your language</option>
                            {languages.map(l => (
                                <option key={l.language_id} value={l.language_id}>
                                    {l.language_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ua-form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input
                            type="tel"
                            id="phone_number"
                            value={phone_number}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                            placeholder="e.g. +1234567890"
                        />
                    </div>

                    <div className="ua-form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value as typeof gender)}
                        >
                            <option value="prefer not to say">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="ua-form-group">
                        <label htmlFor="date_of_birth">Date of Birth</label>
                        <input
                            type="date"
                            id="date_of_birth"
                            value={date_of_birth}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    {error   && <div className="ua-error">{error}</div>}
                    {success && <div className="ua-success">{success}</div>}

                    <div className="ua-actions">
                        <button
                            type="button"
                            className="ua-btn-secondary"
                            onClick={() => navigate('/my-profile')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ua-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default UpdateAccount;
