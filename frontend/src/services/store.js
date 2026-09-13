import api from './api';

export const storeService = {
  createOrUpdateStore: async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data;
  },

  getMyStore: async () => {
    const response = await api.get('/stores/my-store');
    return response.data;
  }
};
