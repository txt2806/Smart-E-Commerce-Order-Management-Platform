import api from './api';

export const productService = {
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get('/products/my-products');
    return response.data;
  },

  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  }
};
