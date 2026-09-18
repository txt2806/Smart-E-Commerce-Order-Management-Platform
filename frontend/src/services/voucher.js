import api from './api';

export const voucherService = {
  getAllVouchers: async () => {
    const response = await api.get('/vouchers');
    return response.data;
  }
};
