import { useState, SubmitEventHandler, ChangeEvent } from "react";
import { signUp,signIn } from "@/services/user_service/auth";
import { Typewriter } from "@/components/user/auth/Typewriter";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import "@/pages/auth/Auth.css";

import logo_img from '@/assets/images/deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';
import hide_pass_img from '@/assets/images/auth/hide_pass.png';
import show_pass_img from '@/assets/images/auth/show_pass.png';


function SignUp(){
    const navigate=useNavigate();
    const [first_name, setFirstName]=useState('');
    const [last_name, setLastName]=useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user_type,setUserType]=useState<'listener' | 'artist'>('listener');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirm_password, setConfirmPassword]=useState('');
    const [show_confirm_password, setShowConfirmPassword]=useState(false);
    const { signin }=useAuth();
    const {theme, toggleTheme}=useTheme();

    const handleSubmit: SubmitEventHandler<HTMLFormElement>=async(e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Hello SignUp');

        try {
            if(password!=confirm_password){
                throw new Error('Make sure both passwords match');
            }
            const response=await signUp(email, password, first_name, last_name, user_type);
            
            if(response && response.user_id){
                const signInResponse=await signIn(email,password);
                console.log('We are almost there');
                console.log(signInResponse.onboarding_done);
                if(signInResponse && signInResponse.token){
                    signin({
                            user_id: signInResponse.user_id,
                            email: email,
                            token: signInResponse.token,
                            user_type: signInResponse.user_type,
                            onboarding_done: signInResponse.onboarding_done
                        });

                    if(theme!='light'){
                        toggleTheme();
                    }else{
                        toggleTheme();
                        toggleTheme();
                    }
                    

                }
                document.cookie = `jwt=${signInResponse.token}; path=/; SameSite=Strict;`;
                console.log('Sign up and sign in done, going to Onboarding');
                navigate('/onboarding');
            }else {
                throw new Error('Sign-up failed');
            }
        }catch(err){
            console.error('Sign-in error:', err);
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
                    <h1>Create Account</h1>
                </div>
                <form onSubmit={handleSubmit} id="signup-form" className="auth-form">
                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            value={first_name}
                            onChange={(e:ChangeEvent<HTMLInputElement>)=>(setFirstName(e.target.value))}
                            placeholder="Enter you first name"
                        required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input 
                            type="text" 
                            id="last_name"
                            value={last_name} 
                            onChange={(e:ChangeEvent<HTMLInputElement>)=>(setLastName(e.target.value))}
                            placeholder="Enter your last name" 
                        required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e:ChangeEvent<HTMLInputElement>)=>(setEmail(e.target.value))}
                            placeholder="Enter your email" 
                        required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />

                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img
                                src={showPassword ? hide_pass_img : show_pass_img}
                                alt="toggle password"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                type={show_confirm_password ? 'text' : 'password'}
                                id="confirm-password"
                                value={confirm_password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowConfirmPassword(!show_confirm_password)}
                            >
                                <img
                                src={show_confirm_password ? hide_pass_img : show_pass_img}
                                alt="toggle password"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="user_type">I am a...</label>
                        <select 
                        id="user_type"
                        value={user_type}
                        onChange={(e) => setUserType(e.target.value as 'listener' | 'artist')}
                        >
                            <option value="listener">Listener</option>
                            <option value="artist">Artist</option>
                        </select>
                    </div>

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
                        {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account?
                        <a
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/sign-in');
                        }}
                        >Sign In</a>
                    </p>
                </div>
            </div>

            
        </div>
    );
}

export default SignUp;