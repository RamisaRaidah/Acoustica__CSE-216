import { getPlanDetails } from "@/services/subscriptions/getPlanDetails";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/pages/subscriptions/GetPlanDetails.css"

interface PlanDetails{
    plan_id: number; 
    plan_type: string;
    plan_cost: number;
    plan_validity: number;
    max_members: number; 
}

function GetPlanDetails(){
    const navigate=useNavigate();
    const [data,setData]=useState<PlanDetails[]>([]);
    const [loading,setLoading]=useState<boolean>(true);
    const [error, setError] = useState('');
    useEffect(()=>{
        
        const loadData=async()=>{
            try{
            const temp_data=await getPlanDetails();
                if(temp_data){
                    setData(temp_data);
                    setLoading(false);
                }
            }
            catch(err){
                console.error('Plan Details failed to load' ,err);
                setError('Plan Details failed to load');
                setLoading(false);
            }
        }
        loadData();
        
    },[]);

    if (loading) return <div className="loading">Loading plans...</div>;
    if (error) return <div className="error">{error}</div>;

    return(
        <div className="GetPlanDetailsContainer">
            <div className="Plan-Header">
                <h1>Subscribe to Acoustica</h1>
                <p>Choose a plan that works for you</p>
            </div>
            <div className="Plan-card">
                
                    {data.map((plan)=>(
                        <div
                            key={plan.plan_id}
                            className={`Plan-Banner ${plan.max_members > 1 ? "Family-Plan" : "Individual-Plan"}`}
                            onClick={() => navigate(`/plans/${plan.plan_id}`)}
                        >
                            <h2>{plan.plan_type}</h2>
                            <p>{plan.plan_validity} days</p>
                            <p>{plan.max_members > 1 ? `Up to ${plan.max_members} members` : "Individual"}</p>
                        </div>
                    ))}
            </div>
        </div>
    );
}
export default GetPlanDetails;