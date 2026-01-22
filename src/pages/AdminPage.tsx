import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const stats = [
  { label: 'Total Bookings', value: '1,234', change: '+12%', icon: Calendar, color: 'primary' },
  { label: 'Active Vehicles', value: '89', change: '+5%', icon: Car, color: 'success' },
  { label: 'Revenue Today', value: '₦2450', change: '+18%', icon: DollarSign, color: 'warning' },
  { label: 'Occupancy Rate', value: '78%', change: '+3%', icon: TrendingUp, color: 'accent' },
];

const recentBookings = [
  { id: 'BK001', plate: 'ABC-1234', type: 'Car', duration: '3h', status: 'active', amount: '₦1500' },
  { id: 'BK002', plate: 'XYZ-5678', type: 'SUV', duration: '6h', status: 'active', amount: '₦4000' },
  { id: 'BK003', plate: 'DEF-9012', type: 'Car', duration: '2h', status: 'completed', amount: '₦1000' },
  { id: 'BK004', plate: 'GHI-3456', type: 'SUV', duration: '4h', status: 'active', amount: '₦2000' },
  { id: 'BK005', plate: 'JKL-7890', type: 'Car', duration: '1h', status: 'pending', amount: '₦500' },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Calendar, label: 'Bookings', active: false },
  { icon: Car, label: 'Vehicles', active: false },
  { icon: Users, label: 'Customers', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/10 text-accent',
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
          <div className="p-6">
            <h2 className="font-display font-bold text-lg">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">Manage your parking facility</p>
          </div>
          <nav className="flex-1 px-4">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors text-left",
                  activeTab === item.label
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Admin</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="gradient">
                  <Clock className="h-4 w-4 mr-2" />
                  Live View
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      colorClasses[stat.color as keyof typeof colorClasses]
                    )}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-success font-medium">{stat.change}</span>
                  </div>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-card rounded-2xl border border-border shadow-card">
              <div className="p-6 border-b border-border">
                <h2 className="font-display text-lg font-semibold">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">License Plate</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="p-4 font-mono text-sm">{booking.id}</td>
                        <td className="p-4 font-medium">{booking.plate}</td>
                        <td className="p-4">{booking.type}</td>
                        <td className="p-4">{booking.duration}</td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                            booking.status === 'active' && "bg-success/10 text-success",
                            booking.status === 'completed' && "bg-muted text-muted-foreground",
                            booking.status === 'pending' && "bg-warning/10 text-warning"
                          )}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold">{booking.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full">
                  View All Bookings
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
