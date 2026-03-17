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

interface CreatePaymentIntentResponse {
    client_secret: string;
    publishable_key: string;
    amount: number;
    plan_type: string;
}

export interface FamilyMember {
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture: string | null;
    is_owner: boolean;
}

export interface FamilyData {
    family_id: number;
    owner_id: number;
    is_owner: boolean;
    max_members: number;
    members: FamilyMember[];
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

export async function createPaymentIntent(
    plan_id: number,
    auto_renewal: 'on' | 'off'
): Promise<CreatePaymentIntentResponse> {
    return api.request<CreatePaymentIntentResponse>('/api/transactions/checkout/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ plan_id, auto_renewal })
    });
}

export async function getSubscriptionDetails() {
    return api.request('/api/subscriptions/details');
}

export async function cancelSubscription(subscription_id: number) {
    return api.request(`/api/subscriptions/${subscription_id}/delete-subscription`, {
        method: 'DELETE'
    });
}

export async function setAutoRenewal(subscription_id: number, mode: 'on' | 'off') {
    return api.request(`/api/subscriptions/${subscription_id}/auto-renewal`, {
        method: 'PATCH',
        body: JSON.stringify({ auto_renewal: mode })
    });
}

export async function getMyFamily() {
    return api.request('/api/subscriptions/my-family');
}

export async function searchUserByEmail(email: string) {
    return api.request(`/api/subscriptions/search-user?email=${encodeURIComponent(email)}`);
}

export async function addFamilyMember(user2_id: number) {
    return api.request(`/api/subscriptions/add-members/${user2_id}`, {
        method: 'POST'
    });
}

export async function leaveFamily() {
    return api.request('/api/subscriptions/leave-family', {
        method: 'DELETE'
    });
}