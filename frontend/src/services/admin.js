import api from './api';

export const adminService = {
  getMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  getStores: async () => {
    const response = await api.get('/admin/stores');
    return response.data;
  },

  updateStoreStatus: async (id, status) => {
    const response = await api.put(`/admin/stores/${id}/status`, { status });
    return response.data;
  }
};
