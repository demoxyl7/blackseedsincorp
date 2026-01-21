import { Car, Zap, Droplets, Shield, Clock, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Car,
    title: 'Cars & SUVs Only',
    description: 'Designed exclusively for personal vehicles. No trucks or lorries to maximize safety and space.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'EV Charging',
    description: 'Fast charging stations for electric and hybrid vehicles. Charge while you park.',
    color: 'success',
  },
  {
    icon: Droplets,
    title: 'Car Wash Services',
    description: 'Professional car wash options from basic to premium detailing.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: '24/7 Security',
    description: 'Round-the-clock surveillance and security personnel for your peace of mind.',
    color: 'warning',
  },
  {
    icon: Clock,
    title: 'Flexible Duration',
    description: 'Book by the hour, day, or month. Extended stays with special rates.',
    color: 'primary',
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Secure Stripe payments. Pay online or on-site with multiple options.',
    color: 'success',
  },
];

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
};

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Premium parking experience with all the modern amenities your vehicle deserves.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
