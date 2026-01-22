import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VehicleSelector } from '@/components/booking/VehicleSelector';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { AddonServices } from '@/components/booking/AddonServices';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { ParkingMap } from '@/components/booking/ParkingMap';
import { useToast } from '@/hooks/use-toast';
import type { VehicleType, ParkingSpot } from '@/types/booking';

const BookingPage = () => {
  const { toast } = useToast();
  
  // Vehicle state
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [isElectric, setIsElectric] = useState(false);
  
  // Parking spot state
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  
  // Time state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2);
  
  // Addons state
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleConfirmBooking = () => {
    // This will integrate with Stripe
    toast({
      title: "Redirecting to payment...",
      description: "You'll be taken to Stripe to complete your booking.",
    });
    
    // TODO: Integrate with Python backend API and Stripe
    console.log('Booking data:', {
      vehicle: { type: vehicleType, licensePlate, isElectric },
      spot: selectedSpot,
      time: { date: selectedDate, startTime, duration },
      addons: selectedAddons,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Book Your Parking Spot
              </h1>
              <p className="text-muted-foreground">
                Complete the steps below to reserve your spot
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Vehicle */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <h2 className="font-display text-xl font-semibold">Your Vehicle</h2>
                  </div>
                  <VehicleSelector
                    vehicleType={vehicleType}
                    onVehicleTypeChange={setVehicleType}
                    isElectric={isElectric}
                    onElectricChange={setIsElectric}
                    licensePlate={licensePlate}
                    onLicensePlateChange={setLicensePlate}
                  />
                </div>

                {/* Step 2: Select Spot */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <h2 className="font-display text-xl font-semibold">Select Your Spot</h2>
                  </div>
                  <ParkingMap
                    selectedSpot={selectedSpot}
                    onSpotSelect={setSelectedSpot}
                    isElectric={isElectric}
                  />
                </div>

                {/* Step 3: Time */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <h2 className="font-display text-xl font-semibold">Date & Time</h2>
                  </div>
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    startTime={startTime}
                    onStartTimeChange={setStartTime}
                    duration={duration}
                    onDurationChange={setDuration}
                  />
                </div>

                {/* Step 4: Add-ons */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      4
                    </div>
                    <h2 className="font-display text-xl font-semibold">Add-on Services</h2>
                  </div>
                  <AddonServices
                    selectedAddons={selectedAddons}
                    onToggleAddon={handleToggleAddon}
                    isElectric={isElectric}
                  />
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                <BookingSummary
                  vehicleType={vehicleType}
                  licensePlate={licensePlate}
                  isElectric={isElectric}
                  selectedSpot={selectedSpot}
                  selectedDate={selectedDate}
                  startTime={startTime}
                  duration={duration}
                  selectedAddons={selectedAddons}
                  onConfirm={handleConfirmBooking}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
