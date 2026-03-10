import { API_BASE_URL } from './config.ts';

class ApiService {
    private static _instance: ApiService;
    constructor() {
        if (ApiService._instance) {
            return ApiService._instance;
        }
        ApiService._instance = this;
    }

    getToken():string|null{
        return localStorage.getItem("token");
    }

    async request<T=any>(endpoint:string, options:RequestInit = {}): Promise<T> {
        try {
            const token=this.getToken();

            const headers:Record<string,string>={ ...options.headers as Record<string,string> };

            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            if(token){
                headers['Authorization']=`Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers,
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } 
        catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

}

export default new ApiService();