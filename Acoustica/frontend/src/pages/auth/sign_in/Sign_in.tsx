import { useState, ChangeEvent, SubmitEventHandler } from "react";
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/services/user_service/auth';
import { Typewriter } from "@/components/user/auth/Typewriter";
import { useAuth } from "@/contexts/AuthContext.tsx"
import { useTheme } from "@/contexts/ThemeContext";
import "@/pages/auth/Auth.css";


import logo_img from '@/assets/images/deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';
import hide_pass_img from '@/assets/images/auth/hide_pass.png';
import show_pass_img from '@/assets/images/auth/show_pass.png';

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {signin }=useAuth();
  const { theme, toggleTheme } = useTheme(); 

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await signIn(email, password);
        if (response && response.token) {
            signin({
                user_id: response.user_id.toString(),
                email: email,
                token: response.token,
                user_type: response.user_type,
                onboarding_done: response.onboarding_done,
                listener_type: response.listener_type ?? undefined
              });

            const chosenTheme = response.theme || 'light';
            if (chosenTheme !== theme) {
              toggleTheme();
            }

              // if (theme === 'dark') {
              //   document.body.classList.add('dark');
              // } else {
              //   document.body.classList.remove('dark');
              // }

              console.log('Signed in successfully');

              if (response.onboarding_done) {
                navigate('/dashboard');
              } else {
                navigate('/onboarding');
              }
        }
    } catch (err) {
          console.error('Sign-in error:', err);
          setError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
          setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <img src={logo_img} id="logo" alt="Logo" />
        <img src={name_img} id="acoustica" alt="Acoustica" />
      </div>

      <div className="auth-left">
        <Typewriter lines={["Let the", "rhythm of", "your life soar"]} />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back!</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
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

          <div className="auth-forgot-pass">
            <a href="/forgot-pass">Forgot your password?</a>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <a
              onClick={(e) => {
                e.preventDefault();
                navigate('/sign-up');
              }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
export default SignIn;