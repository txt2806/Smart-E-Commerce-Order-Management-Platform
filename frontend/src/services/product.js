import api from './api';

let cachedProductsPromise = null;

export const productService = {
  clearCache: () => {
    cachedProductsPromise = null;
  },

  createProduct: async (productData) => {
    productService.clearCache();
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    productService.clearCache();
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get('/products/my-products');
    return response.data;
  },

  getAllProducts: async (forceRefresh = false) => {
    if (forceRefresh || !cachedProductsPromise) {
      cachedProductsPromise = api.get('/products')
        .then(response => response.data)
        .catch(err => {
          cachedProductsPromise = null;
          throw err;
        });
    }
    return cachedProductsPromise;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

