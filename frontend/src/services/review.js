import api from './api';

export const reviewService = {
  getProductReviews: async (productId) => {
    const response = await api.get(`/api/reviews/product/${productId}`);
    return response.data;
  },

  submitReview: async (reviewData) => {
    // reviewData: { productId, rating, comment }
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
  }
};
