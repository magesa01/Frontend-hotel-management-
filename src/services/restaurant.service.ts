import { apiClient } from '@/api/client';
import type { Restaurant } from '@/types';

export const restaurantService = {
  async list(): Promise<{ items: Restaurant[]; total: number }> {
    const { data } = await apiClient.get<Restaurant[]>('/restaurants');
    return { items: data, total: data.length };
  },

  async listByHotel(hotelId: string): Promise<Restaurant[]> {
    const { data } = await apiClient.get<Restaurant[]>(`/hotels/${hotelId}/restaurants`);
    return data;
  },

  async getById(id: string): Promise<Restaurant> {
    const { data } = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return data;
  },

  async create(hotelId: string, payload: Omit<Restaurant, 'id' | 'createdAt' | 'hotelId'>): Promise<Restaurant> {
    const { data } = await apiClient.post<Restaurant>(`/hotels/${hotelId}/restaurants`, payload);
    return data;
  },

  async update(id: string, payload: Partial<Restaurant>): Promise<Restaurant> {
    const { data } = await apiClient.put<Restaurant>(`/restaurants/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/restaurants/${id}`);
    return { id };
  },
};