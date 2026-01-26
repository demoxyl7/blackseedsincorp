import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AdminChatPanel } from '@/components/chat/AdminChatPanel';

interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  active_spots: number;
  utilization_rate: number;
}

interface Booking {
  id: string;
  booking_ref: string;
  customer_email: string;
  spot_id: string;
  booking_date: string;
  total_price: number;
  status: string;
}

const AdminPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { admin, logout, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const statsRes = await axios.get(`${API_BASE}/api/v1/dashboard/stats`, { headers });
        setStats(statsRes.data);

        const bookingsRes = await axios.get(`${API_BASE}/api/v1/dashboard/recent-bookings`, { headers });
        setBookings(bookingsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load dashboard data. Ensure Backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-destructive font-bold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Admin Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          {admin && (
            <p className="text-muted-foreground">Welcome, {admin.name || admin.email}</p>
          )}
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-primary">
          <p className="text-muted-foreground text-sm">Total Revenue</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            ₦{(stats?.total_revenue || 0).toLocaleString()}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-accent">
          <p className="text-muted-foreground text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-foreground">{stats?.total_bookings || 0}</p>
        </div>

        {/* Active Spots */}
        <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-secondary">
          <p className="text-muted-foreground text-sm">Active Spots</p>
          <p className="text-2xl font-bold text-foreground">{stats?.active_spots || 0}</p>
        </div>

        {/* Utilization */}
        <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-muted">
          <p className="text-muted-foreground text-sm">Utilization Rate</p>
          <p className="text-2xl font-bold text-foreground">{stats?.utilization_rate || 0}%</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings Table */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ref</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {bookings.length > 0 ? (
                  bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-muted-foreground">
                        {booking.booking_ref}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {booking.customer_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary font-mono">
                        ₦{(booking.total_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                      No bookings found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Chat Panel */}
        <AdminChatPanel />
      </div>
    </div>
  );
};

export default AdminPage;
