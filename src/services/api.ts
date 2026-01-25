// API Service Layer for FastAPI Backend

import { getApiUrl, API_ENDPOINTS } from '@/lib/api-config';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  BookingResponse,
  ParkingSpotResponse,
  AddonServiceResponse,
  DashboardStatsResponse,
  CustomerResponse,
  PricingConfigResponse,
  BookingFilters,
  SpotAvailabilityQuery,
} from '@/types/api';

// ============= HTTP Helpers =============

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null as T,
        error: data.detail || data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============= Booking API =============

export const bookingApi = {
  // Create a new booking
  create: async (booking: CreateBookingRequest): Promise<ApiResponse<BookingResponse>> => {
    return fetchApi<BookingResponse>(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  },

  // Get all bookings with filters
  getAll: async (filters?: BookingFilters): Promise<ApiResponse<PaginatedResponse<BookingResponse>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<PaginatedResponse<BookingResponse>>(`${API_ENDPOINTS.BOOKINGS}${query}`);
  },

  // Get booking by ID
  getById: async (id: string): Promise<ApiResponse<BookingResponse>> => {
    return fetchApi<BookingResponse>(API_ENDPOINTS.BOOKING_BY_ID(id));
  },

  // Update booking status
  updateStatus: async (id: string, status: UpdateBookingStatusRequest): Promise<ApiResponse<BookingResponse>> => {
    return fetchApi<BookingResponse>(API_ENDPOINTS.BOOKING_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  },

  // Cancel booking
  cancel: async (id: string): Promise<ApiResponse<BookingResponse>> => {
    return fetchApi<BookingResponse>(API_ENDPOINTS.BOOKING_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  },
};

// ============= Parking Spots API =============

export const spotsApi = {
  // Get all spots
  getAll: async (): Promise<ApiResponse<ParkingSpotResponse[]>> => {
    return fetchApi<ParkingSpotResponse[]>(API_ENDPOINTS.SPOTS);
  },

  // Get available spots for a time slot
  getAvailable: async (query: SpotAvailabilityQuery): Promise<ApiResponse<ParkingSpotResponse[]>> => {
    const params = new URLSearchParams({
      date: query.date,
      start_time: query.start_time,
      duration_hours: String(query.duration_hours),
    });
    if (query.is_electric !== undefined) {
      params.append('is_electric', String(query.is_electric));
    }
    return fetchApi<ParkingSpotResponse[]>(`${API_ENDPOINTS.SPOTS_AVAILABLE}?${params.toString()}`);
  },

  // Get spot by ID
  getById: async (id: string): Promise<ApiResponse<ParkingSpotResponse>> => {
    return fetchApi<ParkingSpotResponse>(API_ENDPOINTS.SPOT_BY_ID(id));
  },
};

// ============= Add-ons API =============

export const addonsApi = {
  // Get all available add-on services
  getAll: async (): Promise<ApiResponse<AddonServiceResponse[]>> => {
    return fetchApi<AddonServiceResponse[]>(API_ENDPOINTS.ADDONS);
  },
};

// ============= Dashboard API =============

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return fetchApi<DashboardStatsResponse>(API_ENDPOINTS.DASHBOARD_STATS);
  },

  // Get recent bookings for dashboard
  getRecentBookings: async (limit: number = 10): Promise<ApiResponse<BookingResponse[]>> => {
    return fetchApi<BookingResponse[]>(`${API_ENDPOINTS.DASHBOARD_RECENT_BOOKINGS}?limit=${limit}`);
  },
};

// ============= Customers API =============

export const customersApi = {
  // Get all customers
  getAll: async (page = 1, pageSize = 20): Promise<ApiResponse<PaginatedResponse<CustomerResponse>>> => {
    return fetchApi<PaginatedResponse<CustomerResponse>>(
      `${API_ENDPOINTS.CUSTOMERS}?page=${page}&page_size=${pageSize}`
    );
  },

  // Get customer by ID
  getById: async (id: string): Promise<ApiResponse<CustomerResponse>> => {
    return fetchApi<CustomerResponse>(API_ENDPOINTS.CUSTOMER_BY_ID(id));
  },
};

// ============= Pricing API =============

export const pricingApi = {
  // Get pricing configuration
  getConfig: async (): Promise<ApiResponse<PricingConfigResponse>> => {
    return fetchApi<PricingConfigResponse>(API_ENDPOINTS.PRICING);
  },
};
