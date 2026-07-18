import { apiClient } from '@/api/client';
import type { Booking, BookingStatus } from '@/types';

interface CreateBookingPayload {
  profileId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}

export const bookingService = {
  async list(): Promise<{ items: Booking[]; total: number }> {
    const { data } = await apiClient.get<Booking[]>('/bookings');
    return { items: data, total: data.length };
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },

  async listByUser(userId: string): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>(`/profiles/${userId}/bookings`);
    return data;
  },

  async listByHotel(hotelId: string): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>(`/hotels/${hotelId}/bookings`);
    return data;
  },

  async create(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post<Booking>(
      `/profiles/${payload.profileId}/rooms/${payload.roomId}/bookings`,
      {
        checkInDate: payload.checkIn,
        checkOutDate: payload.checkOut,
        guests: payload.guests,
        notes: payload.notes,
      }
    );
    return data;
  },

  async update(id: string, payload: Partial<Booking>): Promise<Booking> {
    const { data } = await apiClient.put<Booking>(`/bookings/${id}`, {
      checkInDate: payload.checkIn,
      checkOutDate: payload.checkOut,
      guests: payload.guests,
      notes: payload.notes,
    });
    return data;
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const { data } = await apiClient.put<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await apiClient.put<Booking>(`/bookings/${id}/cancel`);
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/bookings/${id}`);
    return { id };
  },
};