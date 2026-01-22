import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Car, Zap, Droplets, Sparkles, Shield, Clock, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Car,
    title: 'Standard Parking',
    description: 'Safe and secure parking for cars and SUVs. Well-lit spaces with easy access.',
    features: ['Cars & SUVs only', 'Covered options available', 'Near entrance spots'],
    price: '₦500/hour',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'EV Charging',
    description: 'Fast charging stations for electric and hybrid vehicles. Multiple charging speeds available.',
    features: ['Level 2 & DC fast charging', 'Real-time availability', 'Automatic billing'],
    price: '₦2000/hour',
    color: 'success',
  },
  {
    icon: Droplets,
    title: 'Basic Car Wash',
    description: 'Quick exterior wash to keep your car looking fresh. Done while you park.',
    features: ['Exterior wash', 'Rinse and dry', '20 min service'],
    price: '₦2000',
    color: 'accent',
  },
  {
    icon: Sparkles,
    title: 'Premium Detailing',
    description: 'Complete interior and exterior cleaning with professional waxing and detailing.',
    features: ['Full interior clean', 'Exterior polish & wax', 'Leather conditioning'],
    price: '₦4500',
    color: 'warning',
  },
];

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
};

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple parking to premium car care, we've got everything your vehicle needs.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="bg-card rounded-2xl border border-border p-8 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colorClasses[service.color as keyof typeof colorClasses]} mb-6`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="font-display text-2xl font-bold text-primary">{service.price}</p>
                    </div>
                    <Link to="/book">
                      <Button variant="gradient">Book Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Why Choose ParkHub?
            </h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: '24/7 Security', desc: 'Round-the-clock surveillance' },
                { icon: Clock, title: 'Flexible Hours', desc: 'Open 24 hours, 7 days' },
                { icon: CreditCard, title: 'Easy Payment', desc: 'Secure online payments' },
                { icon: MapPin, title: 'Prime Location', desc: 'Central city access' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
