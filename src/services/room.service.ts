import { apiClient } from '@/api/client';
import type { Room, RoomStatus } from '@/types';

export const roomService = {
  async list(): Promise<{ items: Room[]; total: number }> {
    const { data } = await apiClient.get<Room[]>('/rooms');
    return { items: data, total: data.length };
  },

  async listByHotel(hotelId: string): Promise<Room[]> {
    const { data } = await apiClient.get<Room[]>(`/hotels/${hotelId}/rooms`);
    return data;
  },

  async listByRoomType(roomTypeId: string): Promise<Room[]> {
    const { data } = await apiClient.get<Room[]>(`/room-types/${roomTypeId}/rooms`);
    return data;
  },

  async getById(id: string): Promise<Room> {
    const { data } = await apiClient.get<Room>(`/rooms/${id}`);
    return data;
  },

  async create(roomTypeId: string, payload: { roomNumber: string; floor: number }): Promise<Room> {
    const { data } = await apiClient.post<Room>(`/room-types/${roomTypeId}/rooms`, payload);
    return data;
  },

  async update(id: string, payload: Partial<Room>): Promise<Room> {
    const { data } = await apiClient.put<Room>(`/rooms/${id}`, payload);
    return data;
  },

  async toggleAvailability(id: string, status: RoomStatus): Promise<Room> {
    const { data } = await apiClient.put<Room>(`/rooms/${id}/availability`, null, {
      params: { isAvailable: status === 'AVAILABLE' },
    });
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/rooms/${id}`);
    return { id };
  },
};