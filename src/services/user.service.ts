import { apiClient } from '@/api/client';
import type { User } from '@/types';

interface ProfileDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  hotelId?: string;
  restaurantId?: string;
}

function toUser(p: ProfileDTO): User {
  return {
    id: p.id,
    name: p.fullName,
    email: p.email,
    phone: p.phoneNumber,
    role: p.role as User['role'],
    createdAt: new Date().toISOString(), // Profile haina createdAt bado
    assignedHotelId: p.hotelId,
    assignedRestaurantId: p.restaurantId,
  };
}

export const userService = {
  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ProfileDTO>(`/profiles/${id}`);
    return toUser(data);
  },

  async update(id: string, payload: Partial<User>): Promise<User> {
    const body = {
      id,
      fullName: payload.name,
      email: payload.email,
      phoneNumber: payload.phone,
    };
    const { data } = await apiClient.post<ProfileDTO>('/profiles', body);
    return toUser(data);
  },

  // Bado hakuna endpoint ya activities kwenye backend
  async getActivities(limit = 6) {
    return [];
  },
};