import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionDetails, cancelSubscription } from '@/services/commerce_service/subscriptions';
import '@/pages/subscriptions/cancel/CancelSubscription.css';

function CancelSubscription() {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSubscriptionDetails();
                setSubscription(data);
                setLoading(false);
            } catch (err) {
                setError('No active subscription found');
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleCancel = async () => {
        if (!confirmed) {
            setError('Please tick the confirmation box first');
            return;
        }
        setCancelling(true);
        setError('');
        try {
            await cancelSubscription(subscription.subscription_id);
            navigate('/cancel/success');
        } catch (err) {
            setError('Failed to cancel subscription. Please try again.');
            setCancelling(false);
        }
    };

    if (loading) return <div className="cancel-loading">Loading subscription...</div>;
    if (!subscription) return (
        <div className="cancel-no-sub">
            <div className="cancel-no-sub-icon">🎵</div>
            <h2>No active subscription</h2>
            <p>You don't have an active subscription to cancel.</p>
            <button className="cancel-back-btn" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
            </button>
        </div>
    );

    return (
        <div className="cancel-container">
            <div className="cancel-header">
                <h1>Cancel Subscription</h1>
                <p>We're sorry to see you go</p>
            </div>

            <div className="cancel-summary">
                <h2>{subscription.plan_type}</h2>
                <p>Active until <strong>{new Date(subscription.end_date).toLocaleDateString()}</strong></p>
                <p className="cancel-price">${subscription.plan_cost} / month</p>
            </div>

            <div className="cancel-warning">
                <div className="cancel-warning-icon">⚠️</div>
                <div className="cancel-warning-text">
                    <h3>What happens when you cancel</h3>
                    <ul>
                        <li>Your premium access ends <strong>immediately</strong></li>
                        <li>You'll be moved back to the free tier</li>
                        <li>Your playlists and data are kept safely</li>
                        <li>You can resubscribe anytime</li>
                    </ul>
                </div>
            </div>

            <div className="cancel-confirm-row">
                <input
                    type="checkbox"
                    id="confirm-cancel"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm-cancel">
                    I understand my premium access will end immediately
                </label>
            </div>

            {error && <div className="cancel-error">{error}</div>}

            <div className="cancel-actions">
                <button
                    className="cancel-confirm-btn"
                    onClick={handleCancel}
                    disabled={cancelling}
                >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
                <button
                    className="cancel-keep-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    Keep My Subscription
                </button>
            </div>
        </div>
    );
}

export default CancelSubscription;