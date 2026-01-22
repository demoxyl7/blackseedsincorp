import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book Parking' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md group-hover:shadow-glow transition-shadow">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Blackseeds<span className="text-gradient">Incorp</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            </Link>
            <Link to="/book">
              <Button variant="gradient" size="sm">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                <Link to="/admin" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
                <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
              <Link to="/book" onClick={() => setIsMenuOpen(false)}>
                <Button variant="gradient" className="w-full mt-2">
                  Book Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
