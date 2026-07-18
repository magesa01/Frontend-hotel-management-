import { apiClient } from '@/api/client';

export interface DashboardStats {
  totalHotels: number;
  totalRoomTypes: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  restaurants: number;
  menuItems: number;
  bookings: number;
  pendingBookings: number;
  checkedInGuests: number;
  reviews: number;
  revenue: number;
}

export interface OccupancyPoint {
  label: string;
  occupancy: number;
  available: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface BookingSourcePoint {
  label: string;
  value: number;
}

export interface RatingPoint {
  label: string;
  count: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },

  async getRevenueTrend(): Promise<RevenuePoint[]> {
    const { data } = await apiClient.get<RevenuePoint[]>('/dashboard/revenue-trend');
    return data;
  },

  async getRatingDistribution(): Promise<RatingPoint[]> {
    const { data } = await apiClient.get<RatingPoint[]>('/dashboard/ratings');
    return data;
  },

  // Schema haina data ya "occupancy history" wala "booking source" bado
  async getOccupancyTrend(): Promise<OccupancyPoint[]> {
    return [];
  },

  async getBookingSources(): Promise<BookingSourcePoint[]> {
    return [];
  },
};