import { API_BASE_URL } from './config.js';

class ApiService {

    async request(endpoint, options = {}){
    try{
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }


  async getHome() {
    return this.request('/');
  }

  async getAssets() {
    return this.request('/assets');
  }

  async addAsset(assetData) {
    return this.request('/add_asset', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }
}


export default new ApiService();