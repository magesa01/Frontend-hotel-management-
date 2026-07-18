import { apiClient } from '@/api/client';
import type { MenuItem, MenuCategory } from '@/types';

export const menuItemService = {
  async list(): Promise<{ items: MenuItem[]; total: number }> {
    const { data } = await apiClient.get<MenuItem[]>('/menu-items');
    return { items: data, total: data.length };
  },

  async listByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    const { data } = await apiClient.get<MenuItem[]>(`/restaurants/${restaurantId}/menu-items`);
    return data;
  },

  async listByRestaurantAndCategory(restaurantId: string, category: MenuCategory): Promise<MenuItem[]> {
    const { data } = await apiClient.get<MenuItem[]>(
      `/restaurants/${restaurantId}/menu-items/category`,
      { params: { category } }
    );
    return data;
  },

  async getById(id: string): Promise<MenuItem> {
    const { data } = await apiClient.get<MenuItem>(`/menu-items/${id}`);
    return data;
  },

  async create(restaurantId: string, payload: Omit<MenuItem, 'id' | 'createdAt' | 'restaurantId'>): Promise<MenuItem> {
    const { data } = await apiClient.post<MenuItem>(`/restaurants/${restaurantId}/menu-items`, payload);
    return data;
  },

  async update(id: string, payload: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await apiClient.put<MenuItem>(`/menu-items/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ id: string }> {
    await apiClient.delete(`/menu-items/${id}`);
    return { id };
  },
};