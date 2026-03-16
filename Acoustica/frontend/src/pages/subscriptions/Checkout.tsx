import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getPlanDetails, createPaymentIntent, GetPlanDetailsResponse } from '@/services/commerce_service/subscriptions';
import '@/pages/subscriptions/Checkout.css';
import { useTheme } from '@/contexts/ThemeContext';

// ===== INNER FORM =====
function CheckoutForm({ plan, clientSecret, onSuccess }: {
    plan: GetPlanDetailsResponse;
    clientSecret: string;
    onSuccess: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [zip, setZip] = useState('');

    const { theme } = useTheme();

    const cardStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: theme === 'dark' ? '#e8e8e8' : '#1a1a1a',
                backgroundColor: 'transparent',
                '::placeholder': { color: '#9ca3af' }
            },
            invalid: { color: '#dc3545' }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) return;

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardNumber }
        });

        if (stripeError) {
            setError(stripeError.message || 'Payment failed');
            setLoading(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-summary">
                <h2>{plan.plan_type}</h2>
                <p>{plan.plan_validity} days access</p>
                {plan.max_members > 1 && <p>Up to {plan.max_members} members</p>}
                <div className="checkout-price">
                    <span className="checkout-amount">${plan.plan_cost}</span>
                    <span className="checkout-period">/ month</span>
                </div>
            </div>

            <div className="checkout-card-section">
                <label className="checkout-label">Card Number</label>
                <div className="checkout-card-wrapper">
                    <CardNumberElement options={cardStyle} />
                </div>
            </div>

            <div className="checkout-card-section">
                <label className="checkout-label">Expiry Date</label>
                <div className="checkout-card-wrapper">
                    <CardExpiryElement options={cardStyle} />
                </div>
            </div>

            <div className="checkout-card-section">
                <label className="checkout-label">CVC</label>
                <div className="checkout-card-wrapper">
                    <CardCvcElement options={cardStyle} />
                </div>
            </div>

            <div className="checkout-card-section">
                <label className="checkout-label">ZIP / Postal Code</label>
                <div className="checkout-card-wrapper">
                    <input
                        type="text"
                        className="checkout-zip-input"
                        placeholder="12345"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        maxLength={10}
                    />
                </div>
            </div>

            <p className="checkout-test-hint">
                Test card: <strong>4242 4242 4242 4242</strong> — any future date — any CVC
            </p>

            {error && <div className="checkout-error">{error}</div>}

            <button
                type="submit"
                className="checkout-submit"
                disabled={!stripe || loading}
            >
                {loading ? 'Processing...' : `Pay $${plan.plan_cost}`}
            </button>
        </form>
    );
}

// ===== OUTER WRAPPER =====
function Checkout() {
    const { plan_id } = useParams<{ plan_id: string }>();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<GetPlanDetailsResponse | null>(null);
    const [clientSecret, setClientSecret] = useState('');
    const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alreadySubscribed, setAlreadySubscribed] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const allPlans = await getPlanDetails();
                console.log('We got Plan Details');
                const found = allPlans.find(p => p.plan_id === Number(plan_id));
                if (!found) { setError('Plan not found'); setLoading(false); return; }
                setPlan(found);
                const result = await createPaymentIntent(found.plan_id, 'off');
                setClientSecret(result.client_secret);
                setStripePromise(loadStripe(result.publishable_key));
                setLoading(false);
            } catch (err) {
                console.log('Hello, do you see this?');
                console.log('caught error:', err);
                console.log('message:', err instanceof Error ? err.message : 'not an Error');
                if (err instanceof Error && err.message.includes('already have an active subscription')) {
                    setAlreadySubscribed(true);
                } else {
                    setError('Failed to initialize checkout');
                }
                setLoading(false);
            }
        };
        init();
    }, [plan_id]);

    if (loading) return <div className="checkout-loading">Preparing checkout...</div>;
    if (alreadySubscribed) return (
        <div className="checkout-already-subscribed">
            <div className="checkout-already-icon">🎵</div>
            <h2>You're already a Premium member!</h2>
            <p>You already have an active subscription running.</p>
            <div className="checkout-already-actions">
                <button className="checkout-submit" onClick={() => navigate('/subscriptions')}>
                    View My Subscription
                </button>
                <button className="checkout-secondary" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
    if (error) return <div className="checkout-error-page">{error}</div>;
    if (!plan || !clientSecret || !stripePromise) return null;

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your subscription</p>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                    plan={plan}
                    clientSecret={clientSecret}
                    onSuccess={() => navigate('/checkout/success')}
                />
            </Elements>
        </div>
    );
}

export default Checkout;