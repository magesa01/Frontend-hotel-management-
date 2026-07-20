import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ProtectedRoute } from '@/routes/protected-route';
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard'));
const HotelsPage = lazy(() => import('@/pages/hotels/hotels-list'));
const HotelDetailPage = lazy(() => import('@/pages/hotels/hotel-detail'));
const HotelFormPage = lazy(() => import('@/pages/hotels/hotel-form'));
const RoomTypesPage = lazy(() => import('@/pages/room-types/room-types-list'));
const RoomTypeFormPage = lazy(() => import('@/pages/room-types/room-type-form'));
const RoomsPage = lazy(() => import('@/pages/rooms/rooms-list'));
const RoomFormPage = lazy(() => import('@/pages/rooms/room-form'));
const BookingsPage = lazy(() => import('@/pages/bookings/bookings-list'));
const BookingDetailPage = lazy(() => import('@/pages/bookings/booking-detail'));
const BookingFormPage = lazy(() => import('@/pages/bookings/booking-form'));
const RestaurantsPage = lazy(() => import('@/pages/restaurants/restaurants-list'));
const RestaurantDetailPage = lazy(() => import('@/pages/restaurants/restaurant-detail'));
const RestaurantFormPage = lazy(() => import('@/pages/restaurants/restaurant-form'));
const MenuItemsPage = lazy(() => import('@/pages/menu-items/menu-items-list'));
const MenuItemFormPage = lazy(() => import('@/pages/menu-items/menu-item-form'));
const ReviewsPage = lazy(() => import('@/pages/reviews/reviews-list'));
const ProfilePage = lazy(() => import('@/pages/profile/profile'));
const NotFoundPage = lazy(() => import('@/pages/errors/not-found'));
const ForbiddenPage = lazy(() => import('@/pages/errors/forbidden'));
const ServerErrorPage = lazy(() => import('@/pages/errors/server-error'));
const AdminManagersPage = lazy(() => import('@/pages/admin/managers'));

const SUPER_ADMIN = ['SUPER_ADMIN'] as const;
const HOTEL_MANAGERS = ['SUPER_ADMIN', 'HOTEL_ADMIN'] as const;
const RESTAURANT_MANAGERS = ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RESTAURANT_ADMIN'] as const;


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Any logged-in user - read-only views + own bookings/profile/reviews */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/hotels/:id" element={<HotelDetailPage />} />
                <Route path="/room-types" element={<RoomTypesPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                <Route path="/menu-items" element={<MenuItemsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />

                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/:id" element={<BookingDetailPage />} />
                <Route path="/bookings/new" element={<BookingFormPage />} />

                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* SUPER_ADMIN only - creating hotels, room types, rooms */}
              <Route
  element={
    <ProtectedRoute roles={[...SUPER_ADMIN]}>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route path="/hotels/new" element={<HotelFormPage />} />
  <Route path="/bookings/:id/edit" element={<BookingFormPage />} />
</Route>

<Route
  element={
    <ProtectedRoute roles={[...HOTEL_MANAGERS]}>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route path="/room-types/new" element={<RoomTypeFormPage />} />
  <Route path="/room-types/:id/edit" element={<RoomTypeFormPage />} />
  <Route path="/rooms/new" element={<RoomFormPage />} />
  <Route path="/rooms/:id/edit" element={<RoomFormPage />} />
</Route>
             

              {/* SUPER_ADMIN + HOTEL_ADMIN - editing own hotel, creating restaurants */}
              <Route
                element={
                  <ProtectedRoute roles={[...HOTEL_MANAGERS]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
                <Route path="/restaurants/new" element={<RestaurantFormPage />} />
              </Route>

              {/* SUPER_ADMIN only - creating hotels, room types, rooms */}
              <Route
                element={
                  <ProtectedRoute roles={[...SUPER_ADMIN]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/hotels/new" element={<HotelFormPage />} />
                <Route path="/bookings/:id/edit" element={<BookingFormPage />} />
                <Route path="/admin/managers" element={<AdminManagersPage />} />
              </Route>

              {/* SUPER_ADMIN + HOTEL_ADMIN + RESTAURANT_ADMIN - restaurant/menu editing */}
              <Route
                element={
                  <ProtectedRoute roles={[...RESTAURANT_MANAGERS]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/restaurants/:id/edit" element={<RestaurantFormPage />} />
                <Route path="/menu-items/new" element={<MenuItemFormPage />} />
                <Route path="/menu-items/:id/edit" element={<MenuItemFormPage />} />
              </Route>

              {/* Errors */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}