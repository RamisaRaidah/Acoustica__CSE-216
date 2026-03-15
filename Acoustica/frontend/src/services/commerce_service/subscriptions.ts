import api from '@/services/api';

export interface GetPlanDetailsResponse{
    plan_id: number; 
    plan_type: string;
    plan_cost: number;
    plan_validity: number;
    max_members: number; 
}

export interface SubscribeResponse{
    message: string,
    subscription_id: number,
    plan_type: string,
    start_date: string,
    end_date: string,
    amount: number
}
export interface SubscribeRequest {
    plan_id: number;
    payment_method: 'bank' | 'card' | 'online';
    auto_renewal?: 'on' | 'off';
}

export async function getPlanDetails():Promise<GetPlanDetailsResponse[]>{
    return api.request<GetPlanDetailsResponse[]>('/api/subscriptions/plans');
}

export async function subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    return api.request<SubscribeResponse>('/api/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify(data) 
    });
}