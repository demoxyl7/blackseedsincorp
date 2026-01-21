export type VehicleType = 'car' | 'suv';

export interface VehicleInfo {
  type: VehicleType;
  licensePlate: string;
  isElectric: boolean;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor: number;
  isAvailable: boolean;
  hasEvCharger: boolean;
  type: 'standard' | 'ev';
}

export interface AddonService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  duration?: number;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
}

export interface Booking {
  id: string;
  userId: string;
  vehicleInfo: VehicleInfo;
  parkingSpot: ParkingSpot;
  timeSlot: TimeSlot;
  addons: AddonService[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  paymentId?: string;
}

export interface PricingConfig {
  hourlyRate: number;
  suvSurcharge: number;
  evChargingPerHour: number;
  carWashBasic: number;
  carWashPremium: number;
}
