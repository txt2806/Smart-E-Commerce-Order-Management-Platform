import api from './api';

export const customerService = {
  getLoyaltyProfile: async () => {
    const response = await api.get('/customer/loyalty');
    return response.data;
  }
};
