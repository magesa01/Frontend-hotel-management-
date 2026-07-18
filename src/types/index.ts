export type UUID = string;

export type UserRole = 'CUSTOMER' | 'HOTEL_ADMIN' | 'RESTAURANT_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Hotel {
  id: UUID;
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  imageUrl: string;
  managerId?: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: UUID;
  hotelId: UUID;
  name: string;
  description: string;
  price: number;
  capacity: number;
  bedType: string;
  sizeSqm: number;
  imageUrl: string;
  amenities: string[];
  createdAt: string;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED';

export interface Room {
  id: UUID;
  hotelId: UUID;
  roomTypeId: UUID;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  createdAt: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export interface Booking {
  id: UUID;
  reference: string;
  hotelId: UUID;
  roomId: UUID;
  roomTypeId: UUID;
  userId: UUID;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: UUID;
  hotelId: UUID;
  name: string;
  description: string;
  cuisine: string;
  imageUrl: string;
  openingHours: string;
  phone: string;
  rating: number;
  createdAt: string;
}

export type MenuCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'DRINK' | 'SNACK';
export interface MenuItem {
  id: UUID;
  restaurantId: UUID;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Review {
  id: UUID;
  hotelId: UUID;
  userId: UUID;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;
  comment: string;
  status: 'PUBLISHED' | 'PENDING' | 'REMOVED';
  createdAt: string;
}

export interface Activity {
  id: UUID;
  type: 'BOOKING' | 'CHECK_IN' | 'CHECK_OUT' | 'REVIEW' | 'HOTEL' | 'ROOM' | 'CANCEL';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
export interface User {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  assignedHotelId?: UUID;       // set only for hotel managers
  assignedRestaurantId?: UUID;  // set only for restaurant managers
}