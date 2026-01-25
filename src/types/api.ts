// API Types for FastAPI Backend Integration

// ============= Request Types =============

export interface CreateBookingRequest {
  vehicle_type: 'car' | 'suv';
  license_plate: string;
  is_electric: boolean;
  spot_id: string;
  booking_date: string; // ISO date string YYYY-MM-DD
  start_time: string; // HH:MM format
  duration_hours: number;
  addon_ids: string[];
  customer_email?: string;
  customer_phone?: string;
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export interface CreateParkingSpotRequest {
  spot_number: string;
  floor: number;
  has_ev_charger: boolean;
  type: 'standard' | 'ev';
}

export interface CustomerRegistrationRequest {
  email: string;
  phone: string;
  full_name: string;
}

// ============= Response Types =============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BookingResponse {
  id: string;
  booking_ref: string;
  vehicle_type: 'car' | 'suv';
  license_plate: string;
  is_electric: boolean;
  spot: ParkingSpotResponse;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  addons: AddonServiceResponse[];
  base_price: number;
  addons_total: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ParkingSpotResponse {
  id: string;
  spot_number: string;
  floor: number;
  is_available: boolean;
  has_ev_charger: boolean;
  type: 'standard' | 'ev';
}

export interface AddonServiceResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  duration_minutes?: number;
}

export interface DashboardStatsResponse {
  total_bookings: number;
  active_vehicles: number;
  revenue_today: number;
  occupancy_rate: number;
  bookings_change_percent: number;
  vehicles_change_percent: number;
  revenue_change_percent: number;
  occupancy_change_percent: number;
}

export interface CustomerResponse {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
}

export interface PricingConfigResponse {
  hourly_rate: number;
  suv_surcharge: number;
  ev_charging_per_hour: number;
  car_wash_basic: number;
  car_wash_premium: number;
}

// ============= Filter/Query Types =============

export interface BookingFilters {
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  date_from?: string;
  date_to?: string;
  vehicle_type?: 'car' | 'suv';
  search?: string; // License plate search
  page?: number;
  page_size?: number;
}

export interface SpotAvailabilityQuery {
  date: string;
  start_time: string;
  duration_hours: number;
  is_electric?: boolean;
}
