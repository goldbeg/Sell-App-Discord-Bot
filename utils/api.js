const axios = require('axios');

const SELLAPP_API_URL = 'https://api.sell.app/v1';
const headers = {
    'Authorization': `Bearer ${process.env.SELLAPP_API_KEY}`,
    'Content-Type': 'application/json'
};

module.exports = {
    SELLAPP_API_URL,
    headers,
    
    async fetchData(endpoint, params = {}) {
        try {
            const response = await axios.get(`${SELLAPP_API_URL}${endpoint}`, { 
                headers,
                params
            });
            return response.data;
        } catch (error) {
            throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
        }
    },

    async postData(endpoint, data = {}) {
        try {
            const response = await axios.post(`${SELLAPP_API_URL}${endpoint}`, data, { headers });
            return response.data;
        } catch (error) {
            throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
        }
    }
};