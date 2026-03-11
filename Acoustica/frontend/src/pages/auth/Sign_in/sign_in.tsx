import { useState, useEffect, ChangeEvent, SubmitEventHandler } from "react";
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/services/auth.ts';
import '@/pages/auth/auth.css';
import logo_img from '@/assets/images/Deco/Logo.png';
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

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signIn(email, password);

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          user_id: response.user_id,
          email: email,
          user_type: response.user_type,
          onboarding_done: response.onboarding_done
        }));


        const theme = response.theme || 'light';
        localStorage.setItem('theme', theme);
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
              href="/sign-up"
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

interface TypewriterProps {
  lines: string[];
}

function Typewriter({ lines }: TypewriterProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [underlineWidth, setUnderlineWidth] = useState(0);

  useEffect(() => {
    if (typing) {
      if (charIndex < lines[lineIndex].length) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex + 1);
        }, 70);
        return () => clearTimeout(timer);
      } else if (lineIndex < lines.length - 1) {
        const timer = setTimeout(() => {
          setLineIndex(lineIndex + 1);
          setCharIndex(0);
        }, 200);
        return () => clearTimeout(timer);
      } else {
        setUnderlineWidth(300);
        const timer = setTimeout(() => {
          setTyping(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      // Erasing
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCharIndex(charIndex - 1);
          setUnderlineWidth((charIndex - 1) / lines[lineIndex].length * 300);
        }, 40);
        return () => clearTimeout(timer);
      } else if (lineIndex > 0) {
        const timer = setTimeout(() => {
          setLineIndex(lineIndex - 1);
          setCharIndex(lines[lineIndex - 1].length);
        }, 200);
        return () => clearTimeout(timer);
      } else {
        setUnderlineWidth(0);
        const timer = setTimeout(() => {
          setTyping(true);
          setLineIndex(0);
          setCharIndex(0);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [lineIndex, charIndex, typing, lines]);

  const currentText = lines
    .slice(0, lineIndex)
    .concat([lines[lineIndex].slice(0, charIndex)])
    .join('\n');

  return (
    <>
      <p className="typewriter">{currentText}</p>
      <div className="auth-underline" style={{ width: `${underlineWidth}px` }} />
    </>
  );
}

export default SignIn;