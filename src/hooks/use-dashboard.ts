import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardStats() {
  return useQuery({ queryKey: ['dashboard', 'stats'], queryFn: () => dashboardService.getStats() });
}

export function useOccupancyTrend() {
  return useQuery({ queryKey: ['dashboard', 'occupancy'], queryFn: () => dashboardService.getOccupancyTrend() });
}

export function useRevenueTrend() {
  return useQuery({ queryKey: ['dashboard', 'revenue'], queryFn: () => dashboardService.getRevenueTrend() });
}

export function useBookingSources() {
  return useQuery({ queryKey: ['dashboard', 'sources'], queryFn: () => dashboardService.getBookingSources() });
}

export function useRatingDistribution() {
  return useQuery({ queryKey: ['dashboard', 'ratings'], queryFn: () => dashboardService.getRatingDistribution() });
}
