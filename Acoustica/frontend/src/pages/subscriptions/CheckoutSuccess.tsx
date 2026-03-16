import { useNavigate } from 'react-router-dom';
import '@/pages/subscriptions/Checkout.css';

function CheckoutSuccess() {
    const navigate = useNavigate();

    return (
        <div className="checkout-success-container">
            <div className="checkout-success-card">
                <div className="checkout-success-icon">🎉</div>
                <h1>You're all set!</h1>
                <p>Your subscription is now active. Enjoy Acoustica Premium.</p>
                <button
                    className="checkout-submit"
                    onClick={() => navigate('/dashboard')}
                >
                    Start Listening
                </button>
            </div>
        </div>
    );
}

export default CheckoutSuccess;