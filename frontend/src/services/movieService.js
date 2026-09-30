import api from './api';

export const movieService = {
  getAll: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/movies', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  create: async (movieData) => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  update: async (id, movieData) => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },
};
