import { apiClient } from '@/api/client';
import type { Hotel, QueryParams } from '@/types';

export const hotelService = {
  async list(params: QueryParams = {}): Promise<{ items: Hotel[]; total: number }> {
    const response = await apiClient.get<Hotel[]>('/hotels', { params });
    return { items: response.data, total: response.data.length };
  },

  async getById(id: string): Promise<Hotel> {
    const response = await apiClient.get<Hotel>(`/hotels/${id}`);
    return response.data;
  },

  async create(payload: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
    const response = await apiClient.post<Hotel>('/hotels', payload);
    return response.data;
  },

  async searchByLocation(location: string): Promise<Hotel[]> {
    const response = await apiClient.get<Hotel[]>('/hotels/search', { params: { location } });
    return response.data;
  },

  // ⚠️ Backend haina PUT/DELETE endpoints bado - hizi zitashindwa (404) mpaka tuziongeze
  async update(id: string, payload: Partial<Hotel>): Promise<Hotel> {
    const response = await apiClient.put<Hotel>(`/hotels/${id}`, payload);
    return response.data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/hotels/${id}`);
    return { id };
  },
};