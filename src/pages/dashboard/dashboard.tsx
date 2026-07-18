import { useAuth } from '@/contexts/auth-context';
import { AdminDashboard } from './admin-dashboard';
import { HotelAdminDashboard } from './hotel-dashboard-admin';
import { RestaurantAdminDashboard } from './restaurant-dashboard-admin';
import { CustomerDashboard } from './customer-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'SUPER_ADMIN') return <AdminDashboard />;
  if (user?.role === 'HOTEL_ADMIN') return <HotelAdminDashboard />;
  if (user?.role === 'RESTAURANT_ADMIN') return <RestaurantAdminDashboard />;
  return <CustomerDashboard />;
}