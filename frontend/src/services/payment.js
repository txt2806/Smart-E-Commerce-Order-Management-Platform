import api from './api';

export const paymentService = {
  getPaymentByOrderId: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  simulateSuccess: async (orderId) => {
    const response = await api.post(`/payments/simulate-success/${orderId}`);
    return response.data;
  }
};
