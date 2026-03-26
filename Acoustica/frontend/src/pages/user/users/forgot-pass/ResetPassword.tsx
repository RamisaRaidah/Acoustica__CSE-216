import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/services/user_service/users';
import { Typewriter } from '@/components/user/auth/Typewriter';
import '@/pages/auth/Auth.css';

import logo_img from '@/assets/images/deco/Logo.png';
import name_img from '@/assets/images/auth/name_2.png';
import show_pass_img from '@/assets/images/auth/show_pass.png';
import hide_pass_img from '@/assets/images/auth/hide_pass.png';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        navigate('/forgot-password');
        return null;
    }

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const getStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z\d]/.test(pwd)) score++;
        return score;
    };

    const strength = getStrength(newPassword);
    const strengthLabel = ['Weak', 'Weak', 'Fair', 'Strong', 'Very strong'][strength];
    const strengthColors = ['#dc3545', '#dc3545', '#e0a02a', '#6abf69', '#198754'];

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password must be 8+ characters with at least one uppercase, lowercase, digit, and special character.');
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, newPassword);
            setSuccess(res.message || 'Password reset successfully.');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/sign-in'), 2000);
        } catch (err: any) {
            setError(err?.message || 'Failed to reset password.');
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
                <Typewriter lines={["Choose a", "new password", "for your account."]} />
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>New Password</h1>
                </div>

                <div className="auth-form">
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowNew(p => !p)}
                            >
                                <img src={showNew ? hide_pass_img : show_pass_img} alt="toggle" />
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Repeat new password"
                            />
                            <button
                                type="button"
                                className="show-pass-btn"
                                onClick={() => setShowConfirm(p => !p)}
                            >
                                <img src={showConfirm ? hide_pass_img : show_pass_img} alt="toggle" />
                            </button>
                        </div>
                    </div>

                    {newPassword && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        width: '36px',
                                        height: '4px',
                                        borderRadius: '999px',
                                        background: strength >= i ? strengthColors[strength] : '#e0e0e0',
                                        transition: 'background 0.3s ease'
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: strengthColors[strength] }}>
                                {strengthLabel}
                            </span>
                        </div>
                    )}

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
                        {loading ? 'Saving...' : 'Reset Password'}
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