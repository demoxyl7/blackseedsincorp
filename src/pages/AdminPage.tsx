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
  Download,
  RefreshCw,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardStats, useRecentBookings, useBookings, useUpdateBookingStatus, useCancelBooking } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BookingResponse } from '@/types/api';

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

const statusColors = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-primary/10 text-primary',
  active: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // API Hooks
  const { data: statsResponse, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: recentBookingsResponse, isLoading: bookingsLoading, refetch: refetchBookings } = useRecentBookings(10);
  const { data: allBookingsResponse, isLoading: allBookingsLoading } = useBookings(
    statusFilter !== 'all' ? { status: statusFilter as any } : undefined
  );
  const updateStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();

  const stats = statsResponse?.data;
  const recentBookings = recentBookingsResponse?.data || [];
  const allBookings = allBookingsResponse?.data?.items || [];

  const handleRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateStatus.mutate({ 
      id: bookingId, 
      status: { status: newStatus as any } 
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking.mutate(bookingId);
    setSelectedBooking(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={stats.total_bookings.toLocaleString()}
              change={`${stats.bookings_change_percent >= 0 ? '+' : ''}${stats.bookings_change_percent}%`}
              color="primary"
            />
            <StatCard
              icon={Car}
              label="Active Vehicles"
              value={stats.active_vehicles.toLocaleString()}
              change={`${stats.vehicles_change_percent >= 0 ? '+' : ''}${stats.vehicles_change_percent}%`}
              color="success"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue Today"
              value={formatCurrency(stats.revenue_today)}
              change={`${stats.revenue_change_percent >= 0 ? '+' : ''}${stats.revenue_change_percent}%`}
              color="warning"
            />
            <StatCard
              icon={TrendingUp}
              label="Occupancy Rate"
              value={`${stats.occupancy_rate}%`}
              change={`${stats.occupancy_change_percent >= 0 ? '+' : ''}${stats.occupancy_change_percent}%`}
              color="accent"
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Unable to load statistics. Is the API running?</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-card rounded-2xl border border-border shadow-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Bookings</h2>
          <Button variant="ghost" size="sm" onClick={() => refetchBookings()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <BookingsTable 
          bookings={recentBookings} 
          loading={bookingsLoading}
          onViewBooking={setSelectedBooking}
          onStatusChange={handleStatusChange}
          formatCurrency={formatCurrency}
        />
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full" onClick={() => setActiveTab('Bookings')}>
            View All Bookings
          </Button>
        </div>
      </div>
    </>
  );

  const renderBookings = () => (
    <div className="bg-card rounded-2xl border border-border shadow-card">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold">All Bookings</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <BookingsTable 
        bookings={allBookings} 
        loading={allBookingsLoading}
        onViewBooking={setSelectedBooking}
        onStatusChange={handleStatusChange}
        formatCurrency={formatCurrency}
      />
    </div>
  );

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
                <h1 className="font-display text-2xl md:text-3xl font-bold">{activeTab}</h1>
                <p className="text-muted-foreground">Welcome back, Admin</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="gradient">
                  <Clock className="h-4 w-4 mr-2" />
                  Live View
                </Button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'Dashboard' && renderDashboard()}
            {activeTab === 'Bookings' && renderBookings()}
            {activeTab !== 'Dashboard' && activeTab !== 'Bookings' && (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{activeTab}</h3>
                <p className="text-muted-foreground">This section will be available when the API is connected.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedBooking?.booking_ref}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-medium capitalize">{selectedBooking.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">License Plate</p>
                  <p className="font-medium">{selectedBooking.license_plate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Spot</p>
                  <p className="font-medium">{selectedBooking.spot?.spot_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBooking.duration_hours}h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedBooking.booking_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedBooking.start_time} - {selectedBooking.end_time}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {formatCurrency(selectedBooking.total_price)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize",
                  statusColors[selectedBooking.status as keyof typeof statusColors]
                )}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedBooking?.status === 'pending' && (
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
            {selectedBooking?.status !== 'cancelled' && selectedBooking?.status !== 'completed' && (
              <Button 
                variant="destructive" 
                onClick={() => handleCancelBooking(selectedBooking!.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  change: string; 
  color: keyof typeof colorClasses 
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center",
          colorClasses[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={cn(
          "text-sm font-medium",
          change.startsWith('+') ? 'text-success' : 'text-destructive'
        )}>{change}</span>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// Bookings Table Component
function BookingsTable({ 
  bookings, 
  loading, 
  onViewBooking,
  onStatusChange,
  formatCurrency
}: { 
  bookings: BookingResponse[];
  loading: boolean;
  onViewBooking: (booking: BookingResponse) => void;
  onStatusChange: (id: string, status: string) => void;
  formatCurrency: (amount: number) => string;
}) {
  if (loading) {
    return (
      <div className="p-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No bookings found</p>
        <p className="text-sm mt-1">Bookings will appear here when customers make reservations.</p>
      </div>
    );
  }

  return (
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
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/50">
              <td className="p-4 font-mono text-sm">{booking.booking_ref}</td>
              <td className="p-4 font-medium">{booking.license_plate}</td>
              <td className="p-4 capitalize">{booking.vehicle_type}</td>
              <td className="p-4">{booking.duration_hours}h</td>
              <td className="p-4">
                <span className={cn(
                  "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize",
                  statusColors[booking.status as keyof typeof statusColors]
                )}>
                  {booking.status}
                </span>
              </td>
              <td className="p-4 font-semibold">{formatCurrency(booking.total_price)}</td>
              <td className="p-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewBooking(booking)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
