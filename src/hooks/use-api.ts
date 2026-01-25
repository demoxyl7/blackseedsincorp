// React Query hooks for API data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, spotsApi, addonsApi, dashboardApi, customersApi, pricingApi } from '@/services/api';
import type { 
  CreateBookingRequest, 
  UpdateBookingStatusRequest, 
  BookingFilters,
  SpotAvailabilityQuery 
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// ============= Query Keys =============

export const queryKeys = {
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  spots: ['spots'] as const,
  spotsAvailable: (query: SpotAvailabilityQuery) => ['spots', 'available', query] as const,
  addons: ['addons'] as const,
  dashboardStats: ['dashboard', 'stats'] as const,
  recentBookings: ['dashboard', 'recent-bookings'] as const,
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  pricing: ['pricing'] as const,
};

// ============= Booking Hooks =============

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: [...queryKeys.bookings, filters],
    queryFn: () => bookingApi.getAll(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => bookingApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (booking: CreateBookingRequest) => bookingApi.create(booking),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        queryClient.invalidateQueries({ queryKey: queryKeys.recentBookings });
        toast({
          title: "Booking created!",
          description: `Your booking reference is ${result.data.booking_ref}`,
        });
      } else {
        toast({
          title: "Booking failed",
          description: result.error || "Unable to create booking",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UpdateBookingStatusRequest }) =>
      bookingApi.updateStatus(id, status),
    onSuccess: (result, { id }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        toast({
          title: "Status updated",
          description: `Booking status changed to ${result.data.status}`,
        });
      }
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        toast({
          title: "Booking cancelled",
          description: "The booking has been cancelled successfully",
        });
      }
    },
  });
}

// ============= Spots Hooks =============

export function useSpots() {
  return useQuery({
    queryKey: queryKeys.spots,
    queryFn: () => spotsApi.getAll(),
  });
}

export function useAvailableSpots(query: SpotAvailabilityQuery | null) {
  return useQuery({
    queryKey: queryKeys.spotsAvailable(query!),
    queryFn: () => spotsApi.getAvailable(query!),
    enabled: !!query?.date && !!query?.start_time,
  });
}

// ============= Addons Hooks =============

export function useAddons() {
  return useQuery({
    queryKey: queryKeys.addons,
    queryFn: () => addonsApi.getAll(),
  });
}

// ============= Dashboard Hooks =============

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useRecentBookings(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.recentBookings, limit],
    queryFn: () => dashboardApi.getRecentBookings(limit),
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

// ============= Customers Hooks =============

export function useCustomers(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...queryKeys.customers, page, pageSize],
    queryFn: () => customersApi.getAll(page, pageSize),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

// ============= Pricing Hooks =============

export function usePricing() {
  return useQuery({
    queryKey: queryKeys.pricing,
    queryFn: () => pricingApi.getConfig(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
