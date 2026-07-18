import { apiClient } from '@/api/client';
import type { Review } from '@/types';

export const reviewService = {
  async list(): Promise<{ items: Review[]; total: number }> {
    const { data } = await apiClient.get<Review[]>('/reviews');
    return { items: data, total: data.length };
  },

  async listByHotel(hotelId: string): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>(`/hotels/${hotelId}/reviews`);
    return data;
  },

  async create(
    hotelId: string,
    profileId: string,
    payload: { rating: number; comment: string }
  ): Promise<Review> {
    const { data } = await apiClient.post<Review>(
      `/hotels/${hotelId}/profiles/${profileId}/reviews`,
      payload
    );
    return data;
  },

  async updateStatus(id: string, status: Review['status']): Promise<Review> {
    const { data } = await apiClient.put<Review>(`/reviews/${id}/status`, { status });
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/reviews/${id}`);
    return { id };
  },
};