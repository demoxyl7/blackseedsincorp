import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ParkingSpot } from '@/types/booking';
import { Car, Zap, CircleParking } from 'lucide-react';

// Mock parking data - would come from Python backend in production
const generateParkingSpots = (): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  
  rows.forEach((row) => {
    for (let i = 1; i <= 8; i++) {
      const isEvSpot = (row === 'A' || row === 'B') && i <= 4;
      const isOccupied = Math.random() > 0.6;
      
      spots.push({
        id: `${row}${i}`,
        spotNumber: `${row}${i}`,
        floor: 1,
        isAvailable: !isOccupied,
        hasEvCharger: isEvSpot,
        type: isEvSpot ? 'ev' : 'standard',
      });
    }
  });
  
  return spots;
};

interface ParkingMapProps {
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
  isElectric: boolean;
}

export const ParkingMap = ({ selectedSpot, onSpotSelect, isElectric }: ParkingMapProps) => {
  const [spots] = useState<ParkingSpot[]>(generateParkingSpots);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);

  const rows = ['A', 'B', 'C', 'D', 'E'];

  const getSpotStatus = (spot: ParkingSpot) => {
    if (!spot.isAvailable) return 'occupied';
    if (selectedSpot?.id === spot.id) return 'selected';
    if (hoveredSpot === spot.id) return 'hovered';
    return 'available';
  };

  const getSpotStyles = (spot: ParkingSpot) => {
    const status = getSpotStatus(spot);
    const isEvSpot = spot.hasEvCharger;
    
    const baseStyles = 'relative w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer';
    
    if (!spot.isAvailable) {
      return cn(baseStyles, 'bg-destructive/20 border-destructive/40 cursor-not-allowed opacity-60');
    }
    
    if (status === 'selected') {
      return cn(baseStyles, 'bg-primary border-primary shadow-glow scale-105');
    }
    
    if (status === 'hovered') {
      return cn(baseStyles, isEvSpot 
        ? 'bg-emerald-500/20 border-emerald-400 scale-105' 
        : 'bg-primary/20 border-primary scale-105'
      );
    }
    
    return cn(baseStyles, isEvSpot 
      ? 'bg-emerald-500/10 border-emerald-500/50 hover:border-emerald-400' 
      : 'bg-secondary border-border hover:border-primary/50'
    );
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    if (!spot.isAvailable) return;
    
    // If user has EV and selects non-EV spot, still allow it
    onSpotSelect(spot);
  };

  const availableCount = spots.filter(s => s.isAvailable).length;
  const evAvailableCount = spots.filter(s => s.isAvailable && s.hasEvCharger).length;

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50" />
          <span className="text-muted-foreground">EV Charging</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border border-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/40" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <CircleParking className="h-4 w-4 text-primary" />
          <span><strong>{availableCount}</strong> spots available</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-500" />
          <span><strong>{evAvailableCount}</strong> EV spots available</span>
        </div>
      </div>

      {/* Parking Map Grid */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
        {/* Entrance indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <span className="text-sm font-medium text-primary">↑ Entrance</span>
          </div>
        </div>

        {/* Driving lane */}
        <div className="relative">
          {rows.map((row, rowIndex) => {
            const rowSpots = spots.filter(s => s.spotNumber.startsWith(row));
            const leftSpots = rowSpots.slice(0, 4);
            const rightSpots = rowSpots.slice(4, 8);
            
            return (
              <div key={row} className="mb-4 last:mb-0">
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  {/* Left side parking */}
                  <div className="flex gap-2">
                    {leftSpots.map((spot) => (
                      <button
                        key={spot.id}
                        onClick={() => handleSpotClick(spot)}
                        onMouseEnter={() => setHoveredSpot(spot.id)}
                        onMouseLeave={() => setHoveredSpot(null)}
                        disabled={!spot.isAvailable}
                        className={getSpotStyles(spot)}
                        aria-label={`Parking spot ${spot.spotNumber}${spot.hasEvCharger ? ' with EV charger' : ''}${!spot.isAvailable ? ' (occupied)' : ''}`}
                      >
                        {spot.hasEvCharger && spot.isAvailable && (
                          <Zap className="h-4 w-4 text-emerald-500 absolute top-1" />
                        )}
                        {!spot.isAvailable ? (
                          <Car className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground rotate-90" />
                        ) : (
                          <span className={cn(
                            "text-xs font-bold",
                            selectedSpot?.id === spot.id ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {spot.spotNumber}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Driving lane */}
                  <div className="w-12 md:w-20 h-20 md:h-24 flex items-center justify-center">
                    {rowIndex === Math.floor(rows.length / 2) && (
                      <div className="text-muted-foreground/50 text-xs rotate-90 whitespace-nowrap">
                        Driving Lane
                      </div>
                    )}
                  </div>

                  {/* Right side parking */}
                  <div className="flex gap-2">
                    {rightSpots.map((spot) => (
                      <button
                        key={spot.id}
                        onClick={() => handleSpotClick(spot)}
                        onMouseEnter={() => setHoveredSpot(spot.id)}
                        onMouseLeave={() => setHoveredSpot(null)}
                        disabled={!spot.isAvailable}
                        className={getSpotStyles(spot)}
                        aria-label={`Parking spot ${spot.spotNumber}${spot.hasEvCharger ? ' with EV charger' : ''}${!spot.isAvailable ? ' (occupied)' : ''}`}
                      >
                        {spot.hasEvCharger && spot.isAvailable && (
                          <Zap className="h-4 w-4 text-emerald-500 absolute top-1" />
                        )}
                        {!spot.isAvailable ? (
                          <Car className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground rotate-90" />
                        ) : (
                          <span className={cn(
                            "text-xs font-bold",
                            selectedSpot?.id === spot.id ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {spot.spotNumber}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exit indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
            <span className="text-sm font-medium text-muted-foreground">Exit ↓</span>
          </div>
        </div>
      </div>

      {/* Selected spot info */}
      {selectedSpot && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
              {selectedSpot.hasEvCharger ? (
                <Zap className="h-6 w-6 text-primary-foreground" />
              ) : (
                <CircleParking className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold">Spot {selectedSpot.spotNumber} Selected</p>
              <p className="text-sm text-muted-foreground">
                {selectedSpot.hasEvCharger ? 'EV Charging Available' : 'Standard Parking Spot'}
                {' • '}Floor {selectedSpot.floor}
              </p>
            </div>
          </div>
          {isElectric && !selectedSpot.hasEvCharger && (
            <p className="mt-3 text-sm text-amber-500">
              ⚡ Tip: You have an EV! Consider selecting a spot with charging (rows A-B, spots 1-4)
            </p>
          )}
        </div>
      )}
    </div>
  );
};
