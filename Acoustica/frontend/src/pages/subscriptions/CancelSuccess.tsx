import { useNavigate } from 'react-router-dom';
import '@/pages/subscriptions/CancelSubscription.css';

function CancelSuccess() {
    const navigate = useNavigate();
    return (
        <div className="cancel-success-container">
            <div className="cancel-success-icon">👋</div>
            <h2>Subscription Cancelled</h2>
            <p>Your subscription has been cancelled and you've been moved to the free tier.</p>
            <p className="cancel-success-sub">We hope to see you back soon!</p>
            <button className="cancel-keep-btn" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
            </button>
        </div>
    );
}

export default CancelSuccess;