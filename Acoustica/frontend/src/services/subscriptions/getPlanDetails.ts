import api from '@/services/api';

interface GetPlanDetailsResponse{
    plan_id: number; 
    plan_type: string;
    plan_cost: number;
    plan_validity: number;
    max_members: number; 
}


export async function getPlanDetails():Promise<GetPlanDetailsResponse[]>{
    return api.request<GetPlanDetailsResponse[]>('/api/subscriptions/plans');
}