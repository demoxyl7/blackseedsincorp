import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const pricingPlans = [
  {
    name: 'Hourly',
    description: 'Perfect for quick stops',
    price: 5,
    unit: '/hour',
    features: [
      'Standard parking spot',
      'Access to all floors',
      'Mobile app access',
      'Real-time availability',
    ],
    popular: false,
  },
  {
    name: 'Daily',
    description: 'Best for full-day parking',
    price: 35,
    unit: '/day',
    features: [
      'All Hourly features',
      'Save 27% vs hourly',
      'Priority spot selection',
      'Free basic car wash',
    ],
    popular: true,
  },
  {
    name: 'Monthly',
    description: 'For regular parkers',
    price: 299,
    unit: '/month',
    features: [
      'All Daily features',
      'Reserved spot',
      'Unlimited entries',
      '2 premium washes/month',
      'EV charging discount',
    ],
    popular: false,
  },
];

const additionalPricing = [
  { service: 'SUV Surcharge', price: '+₦1500/hour' },
  { service: 'EV Charging', price: '₦2000/hour' },
  { service: 'Basic Car Wash', price: '₦2000' },
  { service: 'Premium Detailing', price: '₦4500' },
  { service: 'Premium Spot', price: '+₦5000' },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No surprises. Just great parking at fair prices.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-2xl border-2 p-8 transition-all duration-300 animate-fade-in",
                    plan.popular
                      ? "border-primary bg-card shadow-xl scale-105"
                      : "border-border bg-card shadow-card hover:shadow-card-hover"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display text-4xl font-bold">₦{plan.price}</span>
                      <span className="text-muted-foreground">{plan.unit}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link to="/book">
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Pricing */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Additional Services
            </h2>
            <div className="max-w-md mx-auto bg-card rounded-2xl border border-border overflow-hidden">
              {additionalPricing.map((item, index) => (
                <div
                  key={item.service}
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== additionalPricing.length - 1 && "border-b border-border"
                  )}
                >
                  <span>{item.service}</span>
                  <span className="font-semibold text-primary">{item.price}</span>
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

export default PricingPage;
