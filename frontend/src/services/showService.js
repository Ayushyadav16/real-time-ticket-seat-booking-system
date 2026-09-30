import api from './api';

export const showService = {
  getShows: async (params = {}) => {
    // params: { movieId, theatreId, date }
    const response = await api.get('/shows', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/shows/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/shows', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/shows/${id}`, data);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/shows/${id}`);
    return response.data;
  },
};
