import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gradient-dark text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-primary-foreground">
                BlackseedsIncorp
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Smart parking solutions for the modern driver. Book, park, and go with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/book" className="text-muted-foreground hover:text-primary transition-colors">Book Parking</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Car & SUV Parking</li>
              <li className="text-muted-foreground">EV Charging Stations</li>
              <li className="text-muted-foreground">Car Wash Services</li>
              <li className="text-muted-foreground">24/7 Security</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                76,Karimu Street,Surulere Lagos City
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +234 (803) 268-4135
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                hello@blackseedsincorp.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Blackseedsincorp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
