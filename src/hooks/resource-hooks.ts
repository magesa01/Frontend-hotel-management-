import { makeCrudHooks } from './make-crud-hooks';
import { hotelService } from '@/services/hotel.service';
import { roomTypeService } from '@/services/room-type.service';
import { roomService } from '@/services/room.service';
import { restaurantService } from '@/services/restaurant.service';
import { menuItemService } from '@/services/menu-item.service';
import { reviewService } from '@/services/review.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Hotel,
  MenuItem,
  Restaurant,
  Review,
  Room,
  RoomType,
} from '@/types';

type HotelCreate = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>;
type RoomTypeCreate = Omit<RoomType, 'id' | 'createdAt'>;
type RoomCreate = Omit<Room, 'id' | 'createdAt'>;
type RestaurantCreate = Omit<Restaurant, 'id' | 'createdAt' | 'hotelId'>;
type MenuItemCreate = Omit<MenuItem, 'id' | 'createdAt' | 'restaurantId'>;
type ReviewCreate = { rating: number; comment: string };

export const hotelHooks = makeCrudHooks<Hotel, HotelCreate, Partial<HotelCreate>>('hotels', hotelService);
export const roomTypeHooks = makeCrudHooks<RoomType, RoomTypeCreate, Partial<RoomTypeCreate>>('roomTypes', roomTypeService);
export function useRooms() {
  return useQuery({ queryKey: ['rooms', 'list'], queryFn: () => roomService.list() });
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ['rooms', 'detail', id],
    queryFn: () => roomService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomTypeId, payload }: { roomTypeId: string; payload: { roomNumber: string; floor: number } }) =>
      roomService.create(roomTypeId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Room> }) => roomService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}
// --- Restaurant hooks (custom - create inahitaji hotelId) ---
export function useRestaurants() {
  return useQuery({ queryKey: ['restaurants', 'list'], queryFn: () => restaurantService.list() });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'detail', id],
    queryFn: () => restaurantService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hotelId, payload }: { hotelId: string; payload: RestaurantCreate }) =>
      restaurantService.create(hotelId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

export function useUpdateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Restaurant> }) =>
      restaurantService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

export function useDeleteRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restaurantService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

// --- MenuItem hooks (custom - create inahitaji restaurantId) ---
export function useMenuItems() {
  return useQuery({ queryKey: ['menuItems', 'list'], queryFn: () => menuItemService.list() });
}

export function useMenuItem(id: string | undefined) {
  return useQuery({
    queryKey: ['menuItems', 'detail', id],
    queryFn: () => menuItemService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ restaurantId, payload }: { restaurantId: string; payload: MenuItemCreate }) =>
      menuItemService.create(restaurantId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuItems'] }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MenuItem> }) =>
      menuItemService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuItems'] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuItemService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menuItems'] }),
  });
}

// --- Review hooks (custom - create inahitaji hotelId + profileId) ---
export function useReviews() {
  return useQuery({ queryKey: ['reviews', 'list'], queryFn: () => reviewService.list() });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      hotelId,
      profileId,
      payload,
    }: {
      hotelId: string;
      profileId: string;
      payload: ReviewCreate;
    }) => reviewService.create(hotelId, profileId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Review['status'] }) =>
      reviewService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}