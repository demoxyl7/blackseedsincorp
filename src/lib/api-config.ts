// API Configuration for FastAPI Backend
// Update this to point to your local FastAPI server

export const API_CONFIG = {
  // Base URL for your FastAPI backend
  // During development: http://localhost:8000
  // Production: Update to your deployed API URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // API version prefix
  API_VERSION: '/api/v1',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  BOOKING_STATUS: (id: string) => `/bookings/${id}/status`,
  
  // Parking Spots
  SPOTS: '/spots',
  SPOTS_AVAILABLE: '/spots/available',
  SPOT_BY_ID: (id: string) => `/spots/${id}`,
  
  // Add-on Services
  ADDONS: '/addons',
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  
  // Dashboard / Stats
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_RECENT_BOOKINGS: '/dashboard/recent-bookings',
  
  // Pricing
  PRICING: '/pricing',
  
  // Auth (if needed later)
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
} as const;
