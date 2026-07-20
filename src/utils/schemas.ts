import { z } from 'zod';

export const hotelSchema = z.object({
  name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  rating: z.coerce.number().min(0).max(5, 'Rating must be 0–5'),
  imageUrl: z.string().min(1, 'Image is required'),
});
export type HotelForm = z.infer<typeof hotelSchema>;

export const roomTypeSchema = z.object({
  hotelId: z.string().min(1, 'Select a hotel'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.coerce.number().min(1, 'Price must be positive'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(10),
  bedType: z.string().min(1, 'Bed type is required'),
  sizeSqm: z.coerce.number().min(5, 'Size must be at least 5 m²'),
  imageUrl: z.string().min(1, 'Image is required'),
  amenities: z.string(),
});
export type RoomTypeForm = z.infer<typeof roomTypeSchema>;

export const roomSchema = z.object({
  hotelId: z.string().min(1, 'Select a hotel'),
  roomTypeId: z.string().min(1, 'Select a room type'),
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.coerce.number().min(0, 'Floor must be 0 or positive'),
  status: z.enum(['AVAILABLE', 'OCCUPIED']).optional(),
});
export type RoomForm = z.infer<typeof roomSchema>;

export const bookingSchema = z.object({
  hotelId: z.string().min(1, 'Select a hotel'),
  roomId: z.string().min(1, 'Select a room'),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Valid email is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.coerce.number().min(1, 'At least 1 guest'),
  totalAmount: z.coerce.number().min(1, 'Amount must be positive'),
  notes: z.string().optional(),
}).refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});
export type BookingForm = z.infer<typeof bookingSchema>;

export const restaurantSchema = z.object({
  hotelId: z.string().min(1, 'Select a hotel'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  cuisine: z.string().min(2, 'Cuisine type is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  openingHours: z.string().min(1, 'Opening hours are required'),
  phone: z.string().min(1, 'Phone is required'),
  rating: z.coerce.number().min(0).max(5),
});
export type RestaurantForm = z.infer<typeof restaurantSchema>;

export const menuItemSchema = z.object({
  restaurantId: z.string().min(1, 'Select a restaurant'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'DRINK', 'SNACK']),
  price: z.coerce.number().min(1, 'Price must be positive'),
  imageUrl: z.string().min(1, 'Image is required'),
  isAvailable: z.boolean(),
});
export type MenuItemForm = z.infer<typeof menuItemSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone is required'),
  avatarUrl: z.string().optional(),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phoneNumber: z.string().min(7, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterForm = z.infer<typeof registerSchema>;

export const createAdminSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phoneNumber: z.string().min(7, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['HOTEL_ADMIN', 'RESTAURANT_ADMIN']),
    hotelId: z.string().optional(),
    restaurantId: z.string().optional(),
  })
  .refine((d) => d.role !== 'HOTEL_ADMIN' || !!d.hotelId, {
    message: 'Select a hotel for this Hotel Admin',
    path: ['hotelId'],
  })
  .refine((d) => d.role !== 'RESTAURANT_ADMIN' || !!d.restaurantId, {
    message: 'Select a restaurant for this Restaurant Admin',
    path: ['restaurantId'],
  });
export type CreateAdminForm = z.infer<typeof createAdminSchema>;