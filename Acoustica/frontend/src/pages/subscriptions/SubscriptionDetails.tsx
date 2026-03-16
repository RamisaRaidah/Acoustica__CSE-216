import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionDetails, setAutoRenewal } from '@/services/commerce_service/subscriptions';
import '@/pages/subscriptions/SubscriptionDetails.css';

interface SubscriptionDetailsResponse {
    subscription_id: number;
    start_date: string;
    end_date: string;
    auto_renewal_mode: 'on' | 'off';
    plan_type: string;
    plan_cost: number;
    status: string;
    subscribed_at: string;
}

function SubscriptionDetails() {
    const navigate = useNavigate();
    const [data, setData] = useState<SubscriptionDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [renewalLoading, setRenewalLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await getSubscriptionDetails();
                setData(result);
                setLoading(false);
            } catch (err) {
                setError('No active subscription found');
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleToggleRenewal = async () => {
        if (!data) return;
        setRenewalLoading(true);
        try {
            const newMode = data.auto_renewal_mode === 'on' ? 'off' : 'on';
            await setAutoRenewal(data.subscription_id, newMode);
            setData({ ...data, auto_renewal_mode: newMode });
        } catch (err) {
            setError('Failed to update auto-renewal');
        }
        setRenewalLoading(false);
    };

    const daysLeft = (endDate: string) => {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    if (loading) return <div className="sub-loading">Loading subscription...</div>;

    if (error || !data) return (
        <div className="sub-no-sub">
            <div className="sub-no-sub-icon">🎵</div>
            <h2>No Active Subscription</h2>
            <p>You're currently on the free tier.</p>
            <button className="sub-primary-btn" onClick={() => navigate('/plans')}>
                View Plans
            </button>
        </div>
    );

    const days = daysLeft(data.end_date);
    const isExpiringSoon = days <= 5;

    return (
        <div className="sub-container">
            <div className="sub-header">
                <h1>My Subscription</h1>
                <p>Manage your Acoustica Premium plan</p>
            </div>

            {/* Plan Card */}
            <div className="sub-plan-card">
                <div className="sub-plan-badge">✦ PREMIUM</div>
                <h2>{data.plan_type}</h2>
                <div className="sub-price">
                    <span className="sub-amount">${data.plan_cost}</span>
                    <span className="sub-period">/ month</span>
                </div>
            </div>

            {/* Days remaining */}
            <div className={`sub-days-card ${isExpiringSoon ? 'expiring' : ''}`}>
                <div className="sub-days-number">{days}</div>
                <div className="sub-days-label">days remaining</div>
                {isExpiringSoon && (
                    <div className="sub-expiring-warning">
                        ⚠️ Expiring soon!
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="sub-details-card">
                <div className="sub-detail-row">
                    <span className="sub-detail-label">Start Date</span>
                    <span className="sub-detail-value">
                        {new Date(data.start_date).toLocaleDateString()}
                    </span>
                </div>
                <div className="sub-detail-row">
                    <span className="sub-detail-label">End Date</span>
                    <span className="sub-detail-value">
                        {new Date(data.end_date).toLocaleDateString()}
                    </span>
                </div>
                <div className="sub-detail-row">
                    <span className="sub-detail-label">Subscribed On</span>
                    <span className="sub-detail-value">
                        {new Date(data.subscribed_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="sub-detail-row">
                    <span className="sub-detail-label">Payment Status</span>
                    <span className={`sub-status-badge ${data.status}`}>
                        {data.status}
                    </span>
                </div>
                <div className="sub-detail-row">
                    <span className="sub-detail-label">Auto Renewal</span>
                    <div className="sub-renewal-toggle">
                        <span className={`sub-renewal-status ${data.auto_renewal_mode}`}>
                            {data.auto_renewal_mode === 'on' ? 'On' : 'Off'}
                        </span>
                        <button
                            className="sub-toggle-btn"
                            onClick={handleToggleRenewal}
                            disabled={renewalLoading}
                        >
                            {renewalLoading ? '...' : data.auto_renewal_mode === 'on' ? 'Turn Off' : 'Turn On'}
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="sub-error">{error}</div>}

            {/* Actions */}
            <div className="sub-actions">
                <button
                    className="sub-cancel-btn"
                    onClick={() => navigate('/cancel-subscription')}
                >
                    Cancel Subscription
                </button>
            </div>
        </div>
    );
}

export default SubscriptionDetails;