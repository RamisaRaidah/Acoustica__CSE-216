import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '@/services/user_service/users';
import '@/pages/user/users/change-password/ChangePassword.css';
import showPassImg from '@/assets/images/auth/show_pass.png';
import hidePassImg from '@/assets/images/auth/hide_pass.png';

export default function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
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

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            setError('Password must be 8+ characters with at least one uppercase, lowercase, digit, and special character.');
            return;
        }

        setLoading(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            setSuccess(res.message || 'Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        
        <div className="cp-container">
            <div className="cp-card">
                <span className="ua-section-title">Update your password</span>
                <div className="cp-fields">
                    <div className="ua-form-group">
                        <label>Current Password</label>
                        <div className="cp-input-wrapper">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter current password"
                            />
                            <button
                                className="cp-eye-btn"
                                type="button"
                                onClick={() => setShowCurrent(p => !p)}
                                tabIndex={-1}
                            >
                                <img src={showCurrent ? hidePassImg : showPassImg} alt="toggle visibility" />
                            </button>
                        </div>
                    </div>

                    <div className="cp-divider" />

                    <div className="ua-form-group">
                        <label>New Password</label>
                        <div className="cp-input-wrapper">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter new password"
                            />
                            <button
                                className="cp-eye-btn"
                                type="button"
                                onClick={() => setShowNew(p => !p)}
                                tabIndex={-1}
                            >
                                <img src={showNew ? hidePassImg : showPassImg} alt="toggle visibility" />
                            </button>
                        </div>
                    </div>

                    <div className="ua-form-group">
                        <label>Confirm New Password</label>
                        <div className="cp-input-wrapper">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Repeat new password"
                            />
                            <button
                                className="cp-eye-btn"
                                type="button"
                                onClick={() => setShowConfirm(p => !p)}
                                tabIndex={-1}
                            >
                                <img src={showConfirm ? hidePassImg : showPassImg} alt="toggle visibility" />
                            </button>
                        </div>
                    </div>

                    {newPassword && (
                        <div className="cp-strength">
                           <div className="cp-strength-bars">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`cp-strength-bar ${strength >= i ? 'active' : ''}`} />
                                ))}
                            </div>
                            <span className="cp-strength-label">{strengthLabel}</span>
                        </div>
                    )}

                    {error && <div className="ua-error">{error}</div>}
                    {success && <div className="ua-success">{success}</div>}

                    <div className="ua-actions">
                        <button
                            className="ua-btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="ua-btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
