import { apiClient } from '@/api/client';
import type { RoomType } from '@/types';

export const roomTypeService = {
  async list(): Promise<{ items: RoomType[]; total: number }> {
    const { data } = await apiClient.get<RoomType[]>('/room-types');
    return { items: data, total: data.length };
  },

  async listByHotel(hotelId: string): Promise<RoomType[]> {
    const { data } = await apiClient.get<RoomType[]>(`/hotels/${hotelId}/room-types`);
    return data;
  },

  async getById(id: string): Promise<RoomType> {
    const { data } = await apiClient.get<RoomType>(`/room-types/${id}`);
    return data;
  },

  async create(hotelId: string, payload: Omit<RoomType, 'id' | 'createdAt' | 'hotelId'>): Promise<RoomType> {
    const { data } = await apiClient.post<RoomType>(`/hotels/${hotelId}/room-types`, {
      ...payload,
      pricePerNight: payload.price,
    });
    return data;
  },

  async update(id: string, payload: Partial<RoomType>): Promise<RoomType> {
    const { data } = await apiClient.put<RoomType>(`/room-types/${id}`, {
      ...payload,
      pricePerNight: payload.price,
    });
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/room-types/${id}`);
    return { id };
  },
};