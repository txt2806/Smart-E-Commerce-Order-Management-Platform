import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await api.get('/seller/orders');
    return response.data;
  },

  updateSellerOrderStatus: async (id, status) => {
    const response = await api.put(`/seller/orders/${id}/status`, { status });
    return response.data;
  },

  cancelOrder: async (id, reason) => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  }
};
