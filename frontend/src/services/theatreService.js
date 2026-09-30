import api from './api';

export const theatreService = {
  getAll: async (city = '') => {
    const params = city ? { city } : {};
    const response = await api.get('/theatres', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/theatres/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/theatres', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/theatres/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/theatres/${id}`);
    return response.data;
  },

  getScreens: async (theatreId) => {
    const response = await api.get(`/theatres/${theatreId}/screens`);
    return response.data;
  },

  createScreen: async (theatreId, data) => {
    const response = await api.post(`/theatres/${theatreId}/screens`, data);
    return response.data;
  },

  getSeats: async (screenId) => {
    const response = await api.get(`/screens/${screenId}/seats`);
    return response.data;
  },

  generateSeats: async (screenId, layout) => {
    const response = await api.post(`/screens/${screenId}/seats/generate`, layout);
    return response.data;
  },
};
