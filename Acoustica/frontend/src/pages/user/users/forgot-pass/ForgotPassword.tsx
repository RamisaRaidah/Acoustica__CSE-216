import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '@/services/user_service/users';
import { Typewriter } from '@/components/user/auth/Typewriter';
import '@/pages/auth/Auth.css';

import logo_img from '@/assets/images/deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!email) {
            setError('Email is required.');
            return;
        }

        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setSuccess(res.message || 'If that email exists, a reset link has been sent.');
            setEmail('');
        } catch (err: any) {
            setError(err?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="auth-container">
            <div className="auth-logo">
                <img src={logo_img} id="logo" alt="Logo" />
                <img src={name_img} id="acoustica" alt="Acoustica" />
            </div>

            <div className="auth-left">
                <Typewriter lines={["Forgot your", "password?", "No worries."]} />
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset Password</h1>
                </div>

                <div className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your email"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && (
                        <div className="error-message" style={{
                            color: '#198754',
                            background: 'rgba(25,135,84,0.08)',
                            borderLeft: '3px solid #198754'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Remembered it?{' '}
                        <a onClick={(e) => { e.preventDefault(); navigate('/sign-in'); }}>
                            Back to Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}