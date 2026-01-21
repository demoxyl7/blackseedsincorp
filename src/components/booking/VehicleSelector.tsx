import { Car, Truck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types/booking';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface VehicleSelectorProps {
  vehicleType: VehicleType | null;
  onVehicleTypeChange: (type: VehicleType) => void;
  isElectric: boolean;
  onElectricChange: (isElectric: boolean) => void;
  licensePlate: string;
  onLicensePlateChange: (plate: string) => void;
}

const vehicles = [
  {
    type: 'car' as VehicleType,
    label: 'Car',
    description: 'Sedan, Hatchback, Coupe',
    icon: Car,
  },
  {
    type: 'suv' as VehicleType,
    label: 'SUV',
    description: 'SUV, Crossover, Minivan',
    icon: Car,
  },
];

export function VehicleSelector({
  vehicleType,
  onVehicleTypeChange,
  isElectric,
  onElectricChange,
  licensePlate,
  onLicensePlateChange,
}: VehicleSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Select Vehicle Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.type}
              onClick={() => onVehicleTypeChange(vehicle.type)}
              className={cn(
                "relative p-6 rounded-2xl border-2 transition-all duration-200 text-left",
                vehicleType === vehicle.type
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              <div className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3",
                vehicleType === vehicle.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                <vehicle.icon className="h-6 w-6" />
              </div>
              <p className="font-semibold">{vehicle.label}</p>
              <p className="text-sm text-muted-foreground">{vehicle.description}</p>
              {vehicleType === vehicle.type && (
                <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* No trucks notice */}
        <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive">
          <Truck className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Note:</span> Trucks and lorries are not permitted in this facility.
          </p>
        </div>
      </div>

      {/* License Plate */}
      <div className="space-y-2">
        <Label htmlFor="licensePlate">License Plate Number</Label>
        <Input
          id="licensePlate"
          placeholder="Enter your license plate"
          value={licensePlate}
          onChange={(e) => onLicensePlateChange(e.target.value.toUpperCase())}
          className="uppercase"
        />
      </div>

      {/* EV Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-medium">Electric / Hybrid Vehicle</p>
            <p className="text-sm text-muted-foreground">Need EV charging during your stay?</p>
          </div>
        </div>
        <Switch checked={isElectric} onCheckedChange={onElectricChange} />
      </div>
    </div>
  );
}
