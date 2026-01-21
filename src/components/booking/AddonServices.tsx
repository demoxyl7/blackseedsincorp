import { Droplets, Zap, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddonService } from '@/types/booking';

interface AddonServicesProps {
  selectedAddons: string[];
  onToggleAddon: (addonId: string) => void;
  isElectric: boolean;
}

const addons: AddonService[] = [
  {
    id: 'car-wash-basic',
    name: 'Basic Car Wash',
    description: 'Exterior wash with rinse and dry',
    price: 15,
    icon: 'droplets',
    duration: 20,
  },
  {
    id: 'car-wash-premium',
    name: 'Premium Detailing',
    description: 'Full interior & exterior cleaning with wax',
    price: 45,
    icon: 'sparkles',
    duration: 60,
  },
  {
    id: 'ev-charging',
    name: 'EV Charging',
    description: 'Fast charging for electric vehicles',
    price: 8,
    icon: 'zap',
  },
  {
    id: 'premium-spot',
    name: 'Premium Spot',
    description: 'Covered parking near elevator',
    price: 10,
    icon: 'shield',
  },
];

const iconMap = {
  droplets: Droplets,
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
};

export function AddonServices({ selectedAddons, onToggleAddon, isElectric }: AddonServicesProps) {
  const availableAddons = addons.filter(addon => {
    if (addon.id === 'ev-charging' && !isElectric) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold mb-2">Add-on Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enhance your parking experience with our premium services.
        </p>
      </div>

      <div className="space-y-3">
        {availableAddons.map((addon) => {
          const Icon = iconMap[addon.icon as keyof typeof iconMap];
          const isSelected = selectedAddons.includes(addon.id);

          return (
            <button
              key={addon.id}
              onClick={() => onToggleAddon(addon.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{addon.name}</p>
                <p className="text-sm text-muted-foreground">{addon.description}</p>
                {addon.duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Approx. {addon.duration} minutes
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="font-display font-bold text-lg">
                  ${addon.price}
                </p>
                <p className="text-xs text-muted-foreground">
                  {addon.id === 'ev-charging' ? '/hour' : 'one-time'}
                </p>
              </div>

              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {isSelected && (
                  <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isElectric && (
        <div className="p-4 rounded-xl bg-muted text-muted-foreground text-sm">
          <p>
            <span className="font-medium">💡 Tip:</span> Mark your vehicle as electric/hybrid to see EV charging options.
          </p>
        </div>
      )}
    </div>
  );
}
