import { useQuery } from '@tanstack/react-query';
import { roomTypeService } from '@/services/room-type.service';
import { restaurantService } from '@/services/restaurant.service';
import { menuItemService } from '@/services/menu-item.service';
import { hotelService } from '@/services/hotel.service';
import { roomService } from '@/services/room.service';

export function useRoomTypesByHotel(hotelId: string | undefined) {
  return useQuery({
    queryKey: ['roomTypes', 'hotel', hotelId],
    queryFn: () => roomTypeService.listByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

export function useRestaurantsByHotel(hotelId: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'hotel', hotelId],
    queryFn: () => restaurantService.listByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

export function useMenuByRestaurant(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menuItems', 'restaurant', restaurantId],
    queryFn: () => menuItemService.listByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useHotelsLookup() {
  return useQuery({
    queryKey: ['hotels', 'lookup'],
    queryFn: async () => (await hotelService.list({ page: 1, pageSize: 100 })).items,
    staleTime: 60_000,
  });
}

export function useRoomsLookup() {
  return useQuery({
    queryKey: ['rooms', 'lookup'],
    queryFn: async () => (await roomService.list()).items,
    staleTime: 60_000,
  });
}

export function useRestaurantsLookup() {
  return useQuery({
    queryKey: ['restaurants', 'lookup'],
    queryFn: async () => (await restaurantService.list()).items,
    staleTime: 60_000,
  });
}
