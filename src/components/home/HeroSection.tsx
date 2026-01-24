import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCarImage from '@/assets/hero-car.png';
import carparkVideo from '@/assets/carpark-backdrop.mp4';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Video backdrop */}
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-20"
        >
          <source src={carparkVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              EV Charging Available
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Smart Parking for{' '}
              <span className="text-gradient">Modern Drivers</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Book your parking spot in seconds. Enjoy premium services including EV charging and professional car wash. Cars & SUVs welcome.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book">
                <Button variant="hero" size="xl">
                  Book Your Spot
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="xl">
                  View Services
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="font-display text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Parking Spots</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">EV Chargers</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Security</p>
              </div>
            </div>
          </div>

          {/* Visual - Car Image */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
              <div className="aspect-[4/3] relative">
                <img 
                  src={heroCarImage} 
                  alt="Luxury SUV in parking" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">EV Ready</p>
                  <p className="text-xs text-muted-foreground">Fast charging</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Car Wash</p>
                  <p className="text-xs text-muted-foreground">Premium service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
