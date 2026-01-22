import { format } from 'date-fns';
import { Car, Calendar, Clock, CreditCard, CircleParking, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VehicleType, AddonService, ParkingSpot } from '@/types/booking';

interface BookingSummaryProps {
  vehicleType: VehicleType | null;
  licensePlate: string;
  isElectric: boolean;
  selectedSpot: ParkingSpot | null;
  selectedDate: Date | undefined;
  startTime: string;
  duration: number;
  selectedAddons: string[];
  onConfirm: () => void;
  isLoading?: boolean;
}

const addonDetails: Record<string, { name: string; price: number; perHour?: boolean }> = {
  'car-wash-basic': { name: 'Basic Car Wash', price: 15 },
  'car-wash-premium': { name: 'Premium Detailing', price: 45 },
  'ev-charging': { name: 'EV Charging', price: 8, perHour: true },
  'premium-spot': { name: 'Premium Spot', price: 10 },
};

const HOURLY_RATE = 5;
const SUV_SURCHARGE = 2;

export function BookingSummary({
  vehicleType,
  licensePlate,
  isElectric,
  selectedSpot,
  selectedDate,
  startTime,
  duration,
  selectedAddons,
  onConfirm,
  isLoading,
}: BookingSummaryProps) {
  const basePrice = duration * HOURLY_RATE;
  const suvCharge = vehicleType === 'suv' ? duration * SUV_SURCHARGE : 0;
  
  const addonsTotal = selectedAddons.reduce((total, addonId) => {
    const addon = addonDetails[addonId];
    if (addon.perHour) {
      return total + addon.price * duration;
    }
    return total + addon.price;
  }, 0);

  const totalPrice = basePrice + suvCharge + addonsTotal;
  const isComplete = vehicleType && licensePlate && selectedSpot && selectedDate && startTime && duration;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card sticky top-24">
      <h3 className="font-display text-lg font-semibold mb-6">Booking Summary</h3>

      {isComplete ? (
        <div className="space-y-4">
          {/* Vehicle */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
            <Car className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium capitalize">{vehicleType}</p>
              <p className="text-sm text-muted-foreground">{licensePlate}</p>
              {isElectric && (
                <span className="inline-flex items-center text-xs text-success mt-1">
                  ⚡ Electric/Hybrid
                </span>
              )}
            </div>
          </div>

          {/* Parking Spot */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
            <CircleParking className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Spot {selectedSpot.spotNumber}</p>
              <p className="text-sm text-muted-foreground">
                Floor {selectedSpot.floor}
                {selectedSpot.hasEvCharger && (
                  <span className="inline-flex items-center text-emerald-500 ml-2">
                    <Zap className="h-3 w-3 mr-1" /> EV Charger
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{format(selectedDate, 'EEEE, MMM d')}</p>
              <p className="text-sm text-muted-foreground">
                {startTime} • {duration} hour{duration > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Parking ({duration}h × ₦{HOURLY_RATE})</span>
              <span>₦{basePrice.toFixed(2)}</span>
            </div>
            
            {suvCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SUV Surcharge ({duration}h × ₦{SUV_SURCHARGE})</span>
                <span>₦{suvCharge.toFixed(2)}</span>
              </div>
            )}

            {selectedAddons.map((addonId) => {
              const addon = addonDetails[addonId];
              const addonPrice = addon.perHour ? addon.price * duration : addon.price;
              return (
                <div key={addonId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{addon.name}</span>
                  <span>₦{addonPrice.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display text-2xl font-bold text-primary">
                ₦{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full mt-4"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <CreditCard className="h-5 w-5" />
            {isLoading ? 'Processing...' : 'Pay with Stripe'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe
          </p>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Complete your booking details to see the summary</p>
        </div>
      )}
    </div>
  );
}
