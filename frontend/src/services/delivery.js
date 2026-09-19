import api from './api';

export const deliveryService = {
  getDelivery: async (sellerOrderId) => {
    const response = await api.get(`/deliveries/${sellerOrderId}`);
    return response.data;
  },

  createOrUpdateDelivery: async (sellerOrderId, carrier, trackingNumber) => {
    const response = await api.post(`/deliveries/${sellerOrderId}`, {
      carrier,
      trackingNumber
    });
    return response.data;
  }
};
