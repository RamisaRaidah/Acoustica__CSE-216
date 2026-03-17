import { getPlanDetails, GetPlanDetailsResponse } from "@/services/commerce_service/subscriptions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/pages/subscriptions/plans/Plans.css"
import person from "@/assets/images/commerce/Individual_Plan.png"
import family from "@/assets/images/commerce/Family_Plan.png"

function Plans() {
    const navigate = useNavigate();
    const [data, setData] = useState<GetPlanDetailsResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');
    useEffect(() => {

        const loadData = async () => {
            try {
                const temp_data = await getPlanDetails();
                if (temp_data) {
                    setData(temp_data);
                    setLoading(false);
                }
            }
            catch (err) {
                console.error('Plan Details failed to load', err);
                setError('Plan Details failed to load');
                setLoading(false);
            }
        }
        loadData();

    }, []);

    if (loading) return <div className="loading">Loading plans...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="GetPlanDetailsContainer">
            <div className="Plan-Header">
                <h1>Subscribe to Acoustica</h1>
                <p>Choose a plan that works for you</p>
            </div>
            <div className="Plan-card">
                {data.map((plan) => (
                    <div
                        key={plan.plan_id}
                        className={`Plan-Banner ${plan.max_members > 1 ? "Family-Plan" : "Individual-Plan"}`}

                    >
                        <div className="banner-image">
                            {plan.max_members === 1 && (
                                <img className="individual-image" src={person} alt="Individual Plan" />
                            )}

                            {plan.max_members > 1 && (
                                <img className="family-image" src={family} alt="Family Plan" />
                            )}
                        </div>

                        <div className="plan-cta"
                            onClick={() => navigate(`/plan-details/${plan.plan_id}`)}
                        >
                            Get Details
                        </div>

                        <div className="banner-writing">
                            <h2>{plan.plan_type}</h2>
                            <p>{plan.plan_validity} days access</p>
                            <p>{plan.max_members > 1 ? `Up to ${plan.max_members} members` : "Individual"}</p>

                            <p className="plan-tagline">
                                {plan.max_members > 1
                                    ? "Music for the whole family"
                                    : "Your personal music journey"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Plans;