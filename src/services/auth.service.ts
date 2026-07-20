import { supabase, createTempSupabaseClient } from '@/lib/supabase';
import { apiClient, setStoredSession } from '@/api/client';
import type { User, UserRole } from '@/types';

interface BackendProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  hotelId?: string;
  restaurantId?: string;
}

function mapProfileToUser(profile: BackendProfile, createdAt: string): User {
  return {
    id: profile.id,
    name: profile.fullName,
    email: profile.email,
    phone: profile.phoneNumber,
    role: profile.role,
    createdAt,
    assignedHotelId: profile.hotelId,
    assignedRestaurantId: profile.restaurantId,
  };
}
function apiError(message: string, status: number) {
  return Object.assign(new Error(message), { status, isApiError: true });
}

export const authService = {
  // Password goes straight to Supabase — never touches our Spring Boot backend.
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      throw apiError(error?.message ?? 'Invalid email or password', 401);
    }

    const token = data.session.access_token;
    const { data: profile } = await apiClient.get<BackendProfile>(`/profiles/${data.user.id}`);
    const user = mapProfileToUser(profile, data.user.created_at ?? new Date().toISOString());

    setStoredSession(token, JSON.stringify(user));
    return { user, token };
  },

  // Customer self-registration only. Admin/Manager accounts are created directly
  // by a super admin elsewhere — never through this flow.
  async register(input: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ user: User; token: string } | { requiresEmailConfirmation: true }> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) {
      throw apiError(error?.message ?? 'Could not create account', 400);
    }


    // Only profile fields go to our backend — no password, ever.
    const { data: profile } = await apiClient.post<BackendProfile>('/profiles', {
      id: data.user.id,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      role: 'CUSTOMER',
    });

    // If Supabase email confirmation is ON, there's no session yet.
    if (!data.session) {
      return { requiresEmailConfirmation: true };
    }

    const token = data.session.access_token;
    const user = mapProfileToUser(profile, data.user.created_at ?? new Date().toISOString());
    setStoredSession(token, JSON.stringify(user));
    return { user, token };
  },

  // Called by a logged-in Super Admin to create a Hotel/Restaurant Admin account.
  // Uses a throwaway Supabase client so the Super Admin's own session is untouched.
  async createAdminAccount(input: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: 'HOTEL_ADMIN' | 'RESTAURANT_ADMIN';
    hotelId?: string;
    restaurantId?: string;
  }): Promise<User> {
    const tempClient = createTempSupabaseClient();
    const { data, error } = await tempClient.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) {
      throw apiError(error?.message ?? 'Could not create admin account', 400);
    }

    const { data: profile } = await apiClient.post<BackendProfile>('/profiles', {
      id: data.user.id,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      role: input.role,
      hotelId: input.hotelId,
      restaurantId: input.restaurantId,
    });

    return mapProfileToUser(profile, data.user.created_at ?? new Date().toISOString());
  },

  async me(token: string): Promise<User> {
    const { data: supaUser, error } = await supabase.auth.getUser(token);
    if (error || !supaUser.user) {
      throw apiError('Unauthorized', 401);
    }
    const { data: profile } = await apiClient.get<BackendProfile>(`/profiles/${supaUser.user.id}`);
    return mapProfileToUser(profile, supaUser.user.created_at ?? new Date().toISOString());
  },

  async requestPasswordReset(email: string): Promise<{ sent: boolean }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw apiError(error.message, 400);
    return { sent: true };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};

export const ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full platform access' },
  { role: 'HOTEL_ADMIN', label: 'Hotel Admin', description: 'Manage an assigned hotel' },
  { role: 'RESTAURANT_ADMIN', label: 'Restaurant Admin', description: 'Manage an assigned restaurant' },
  { role: 'CUSTOMER', label: 'Customer', description: 'Book & review stays' },
];