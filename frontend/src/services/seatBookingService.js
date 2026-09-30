import api from './api';

export const seatBookingService = {
  getShowSeats: async (showId) => {
    const response = await api.get(`/shows/${showId}/seats`);
    return response.data;
  },

  lockSeats: async (showId, seatIds) => {
    const response = await api.post(`/shows/${showId}/seats/lock`, { seatIds });
    return response.data;
  },

  unlockSeats: async (showId, seatIds) => {
    const response = await api.post(`/shows/${showId}/seats/unlock`, { seatIds });
    return response.data;
  },
};
