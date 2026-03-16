import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPlanDetails, GetPlanDetailsResponse } from '@/services/commerce_service/subscriptions';
import '@/pages/subscriptions/PlanDetails.css';
import personImage from '@/assets/images/commerce/Individual_Plan.png';
import familyImage from '@/assets/images/commerce/Family_Plan.png';

function PlanDetails() {
    const navigate = useNavigate();
    const { plan_id } = useParams<{ plan_id: string }>();

    const [plan, setPlan] = useState<GetPlanDetailsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const isFamily = (plan?.max_members ?? 0) > 1;

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const allPlans = await getPlanDetails();
                const found = allPlans.find(p => p.plan_id === Number(plan_id));
                if (found) {
                    setPlan(found);
                } else {
                    setError('Plan not found');
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to load plan:', err);
                setError('Failed to load plan details');
                setLoading(false);
            }
        };
        loadPlan();
    }, [plan_id]);

    if (loading) return <div className="plan-loading">Loading plan details...</div>;
    if (error) return <div className="plan-error">{error}</div>;
    if (!plan) return <div className="plan-error">Plan not found</div>;

    const individualFeatures = [
        'Unlimited listening',
        'Unlimited skips',
        'Play any song on-demand',
        'Unlimited playlists',
        'AI-powered recommendations',
        'Access to full music library'
    ];

    const familyFeatures = [
        'Unlimited free listening',
        'Unlimited skips',
        'Family Shared Content',
        'Play any song on-demand',
        'Unlimited playlists',
        'AI-powered recommendations',
        'Access to full music library'
    ];

    const individualFaqs = [
        { question: 'Can I cancel anytime?', answer: 'Yes, cancel anytime without penalty' },
        { question: 'What happens after 30 days?', answer: 'You can choose to renew or go back to free tier. You can also set auto-renewal on' },
        { question: 'Can I upgrade to Family plan later?', answer: 'You have to cancel this subscription or wait for its expiry' }
    ];

    const familyFaqs = [
        { question: 'Can I cancel anytime?', answer: 'Yes, cancel anytime without penalty' },
        { question: 'What happens after 30 days?', answer: 'You can choose to renew or go back to free tier' },
        { question: 'How do I add family members?', answer: 'After subscribing, you can invite up to 5 members from your account settings' }
    ];

    const features = isFamily ? familyFeatures : individualFeatures;
    const faqs = isFamily ? familyFaqs : individualFaqs;

    return (
        <div className={`plan-container ${isFamily ? 'family' : 'individual'}`}>

            <div className="plan-header">
                <h1>{isFamily ? 'Family Plan' : 'Individual Plan'}</h1>
                <p className="plan-tagline">
                    {isFamily ? 'Music for the whole family' : 'Your personal music journey'}
                </p>
            </div>

            <div className="plan-hero">
                <div className="plan-image-wrapper">
                    <img
                        src={isFamily ? familyImage : personImage}
                        alt={isFamily ? 'Family Plan' : 'Individual Plan'}
                        className="plan-image"
                    />
                </div>

                <div className="plan-pricing">
                    <div className="plan-price-display">
                        <span className="plan-price">${plan.plan_cost}</span>
                        <span className="plan-period">/ month</span>
                    </div>
                    <p className="plan-duration">{plan.plan_validity} days access</p>
                    {isFamily && (
                        <p className="plan-members">Up to {plan.max_members} members</p>
                    )}
                    <button
                        className="plan-subscribe-button"
                        onClick={() => navigate(`/checkout/${plan.plan_id}`)}
                    >
                        Subscribe Now
                    </button>
                </div>
            </div>

            <div className="plan-section">
                <h2>What's Included</h2>
                <div className="plan-features-list">
                    {features.map((feature, index) => (
                        <div key={index} className="plan-feature-item">
                            <span className="plan-checkmark">✓</span>
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="plan-section">
                <h2>Plan Details</h2>
                <div className="plan-details-grid">
                    <div className="plan-detail-row">
                        <span className="plan-label">Subscription Type</span>
                        <span className="plan-value">{isFamily ? 'Family' : 'Individual'}</span>
                    </div>
                    <div className="plan-detail-row">
                        <span className="plan-label">Billing Cycle</span>
                        <span className="plan-value">Monthly</span>
                    </div>
                    <div className="plan-detail-row">
                        <span className="plan-label">Max Users</span>
                        <span className="plan-value">{isFamily ? `Up to ${plan.max_members} members` : '1'}</span>
                    </div>
                    <div className="plan-detail-row">
                        <span className="plan-label">Auto-renewal</span>
                        <span className="plan-value">Optional</span>
                    </div>
                    <div className="plan-detail-row">
                        <span className="plan-label">Cancellation</span>
                        <span className="plan-value">Cancel anytime</span>
                    </div>
                </div>
            </div>

            <div className="plan-section">
                <h2>Frequently Asked Questions</h2>
                <div className="plan-faq-container">
                    {faqs.map((faq, index) => (
                        <div key={index} className="plan-faq-item">
                            <h3 className="plan-question">Q: {faq.question}</h3>
                            <p className="plan-answer">A: {faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default PlanDetails;